#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parseYamlFile } from "./lib/yaml-lite.mjs";
import { validateSchema } from "./lib/schema-lite.mjs";
import { buildStateReport } from "./lib/harness-state.mjs";

const root = process.cwd();
const defaultRunDir = "output/harness-runs/2026-05-20-harness-maker-bootstrap/harness-maker";
const runDir = path.resolve(root, process.argv[2] || defaultRunDir);
const schemaDir = path.join(root, "schemas/harness-run");

const requiredArtifacts = [
  "intake.md",
  "classification.yaml",
  "proposal/harness-change-proposal.md",
  "proposal/affected-files.yaml",
  "proposal/acceptance-criteria.yaml",
  "proposal/rollback-plan.md",
  "reviews/cso-review.md",
  "reviews/qa-review.md",
  "handoff/downstream-chat-brief.md",
  "handoff/required-files.yaml",
  "handoff/startup-prompt.md",
  "handoff/operator-checklist.md",
  "archive/run-summary.md"
];

const startupPromptTerms = [
  "harness_variant",
  "purpose_variant",
  "kimi_cli_decision",
  "deep_interview_required",
  "Deep Interview",
  "KIMI",
  "PM-level",
  "20",
  "CSO",
  "QA"
];

const failures = [];
const warnings = [];
const parsedYaml = new Map();
let classification = null;
let stateReport = [];

const schemas = {
  classification: readJsonSchema("classification.schema.json"),
  deepInterviewSummary: readJsonSchema("deep-interview-summary.schema.json"),
  pmDebateSummary: readJsonSchema("pm-debate-summary.schema.json"),
  compoundApprovalCandidates: readJsonSchema("compound-approval-candidates.schema.json")
};

function readJsonSchema(fileName) {
  return JSON.parse(fs.readFileSync(path.join(schemaDir, fileName), "utf8"));
}

function exists(relativePath) {
  return fs.existsSync(path.join(runDir, relativePath));
}

function read(relativePath) {
  const fullPath = path.join(runDir, relativePath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
}

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function parseRunYaml(relativePath) {
  if (parsedYaml.has(relativePath)) return parsedYaml.get(relativePath);
  if (!exists(relativePath)) return null;

  try {
    const value = parseYamlFile(path.join(runDir, relativePath));
    parsedYaml.set(relativePath, value);
    return value;
  } catch (error) {
    fail(`${relativePath} YAML parse failed: ${error.message}`);
    return null;
  }
}

function validateYamlSchema(relativePath, value, schema) {
  if (!value) return;
  for (const error of validateSchema(value, schema)) {
    fail(`${relativePath} ${error}`);
  }
}

function resolveWorkspacePath(entryPath) {
  return path.isAbsolute(entryPath) ? entryPath : path.join(root, entryPath);
}

function manifestPathExists(entryPath) {
  if (path.isAbsolute(entryPath)) return fs.existsSync(entryPath);

  const candidates = [
    path.join(root, entryPath),
    path.join(runDir, entryPath)
  ];
  return candidates.some((candidate) => fs.existsSync(candidate));
}

function validateRequiredArtifacts() {
  for (const artifact of requiredArtifacts) {
    if (!exists(artifact)) fail(`missing artifact: ${artifact}`);
  }
}

function validateClassification() {
  classification = parseRunYaml("classification.yaml");
  validateYamlSchema("classification.yaml", classification, schemas.classification);
  if (!classification) return;

  if (classification.deep_interview_required === true) {
    validateDeepInterviewArtifacts();
  } else if (classification.deep_interview_required === false && !classification.deep_interview_reason) {
    fail("deep_interview_required is false but deep_interview_reason is empty");
  }

  if (classification.kimi_cli_decision === "use" || classification.harness_variant === "kimi-active") {
    validateKimiArtifacts();
  } else if (classification.kimi_cli_decision === "skip" && !classification.kimi_cli_reason) {
    fail("kimi_cli_decision is skip but kimi_cli_reason is empty");
  }

  const expectedCompound = shouldRequireCompound(classification.purpose_variant, Number(classification.friction_level));
  if (classification.compound_extraction_required === true) {
    validateCompoundArtifacts();
  } else if (classification.compound_extraction_required === false) {
    if (!classification.compound_extraction_reason) {
      fail("compound_extraction_required is false but compound_extraction_reason is empty");
    }
    if (expectedCompound) {
      fail(`compound_extraction_required is false but purpose/friction requires it: ${classification.purpose_variant}, friction ${classification.friction_level}`);
    }
  }
}

function shouldRequireCompound(purposeVariant, frictionLevel) {
  return [
    "research",
    "product_decision",
    "implementation",
    "release",
    "bootstrap_handoff"
  ].includes(purposeVariant) || frictionLevel >= 2;
}

function validateDeepInterviewArtifacts() {
  const required = [
    "deep-interview/questions.yaml",
    "deep-interview/summary.yaml"
  ];
  for (const artifact of required) {
    if (!exists(artifact)) fail(`deep interview required but missing: ${artifact}`);
  }

  const summary = parseRunYaml("deep-interview/summary.yaml");
  validateYamlSchema("deep-interview/summary.yaml", summary, schemas.deepInterviewSummary);
}

function validateKimiArtifacts() {
  const required = [
    "kimi/collaborator-critique.yaml",
    "pm-debate/debate-summary.yaml"
  ];
  for (const artifact of required) {
    if (!exists(artifact)) fail(`KIMI-active run missing: ${artifact}`);
  }

  const summary = parseRunYaml("pm-debate/debate-summary.yaml");
  validateYamlSchema("pm-debate/debate-summary.yaml", summary, schemas.pmDebateSummary);
}

function validateCompoundArtifacts() {
  const required = [
    "compound/reusable-lessons.md",
    "compound/proposed-future-rules.md",
    "compound/recurring-failure-patterns.md",
    "compound/operator-approval-candidates.yaml"
  ];
  for (const artifact of required) {
    if (!exists(artifact)) fail(`compound extraction required but missing: ${artifact}`);
  }

  const candidates = parseRunYaml("compound/operator-approval-candidates.yaml");
  validateYamlSchema("compound/operator-approval-candidates.yaml", candidates, schemas.compoundApprovalCandidates);
  enforceCompoundProposedGovernance(candidates);
}

function enforceCompoundProposedGovernance(candidates) {
  if (!candidates || !Array.isArray(candidates.approval_candidates)) return;

  for (const candidate of candidates.approval_candidates) {
    if (candidate.status !== "proposed") {
      fail(`compound approval candidate ${candidate.id || "(missing id)"} must remain proposed before operator approval`);
    }
  }
}

function validateHandoffManifest() {
  const manifest = parseRunYaml("handoff/required-files.yaml");
  if (!manifest) return;

  const entries = [
    ...manifestEntries(manifest.required_files, true),
    ...manifestEntries(manifest.optional_files, false),
    ...manifestEntries(manifest.external_reference_corpora, false)
  ];
  if (entries.length === 0) fail("handoff/required-files.yaml has no path entries");

  for (const entry of entries) {
    if (!entry.path) {
      fail("handoff/required-files.yaml contains an entry without path");
      continue;
    }
    if (!manifestPathExists(entry.path)) {
      const severity = entry.required ? "missing required manifest path" : "missing optional manifest path";
      fail(`${severity}: ${entry.path}`);
    }
  }
}

function manifestEntries(value, defaultRequired) {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => ({
    path: entry.path,
    required: typeof entry.required === "boolean" ? entry.required : defaultRequired
  }));
}

function validateStartupPrompt() {
  if (!exists("handoff/startup-prompt.md")) return;

  const text = read("handoff/startup-prompt.md");
  for (const term of startupPromptTerms) {
    if (!text.toLowerCase().includes(term.toLowerCase())) {
      fail(`handoff/startup-prompt.md missing term: ${term}`);
    }
  }
}

function validateAcceptanceCriteria() {
  const criteriaYaml = parseRunYaml("proposal/acceptance-criteria.yaml");
  if (!criteriaYaml) return;

  const criteria = criteriaYaml.acceptance_criteria;
  if (!Array.isArray(criteria) || criteria.length === 0) {
    fail("proposal/acceptance-criteria.yaml has no acceptance_criteria entries");
    return;
  }

  let passCount = 0;
  for (const item of criteria) {
    if (item.status === "pass") {
      passCount += 1;
    } else {
      fail(`proposal/acceptance-criteria.yaml contains non-pass status for ${item.id || "(missing id)"}`);
    }
  }
  if (passCount === 0) warn("proposal/acceptance-criteria.yaml has no explicit pass status");
}

function validateRunSummary() {
  if (!exists("archive/run-summary.md")) return;

  const text = read("archive/run-summary.md");
  if (!/validation/i.test(text)) {
    fail("archive/run-summary.md missing validation section or validation wording");
  }
}

function validateStateTransitions() {
  if (!classification) return;
  stateReport = buildStateReport({ classification, exists, read });
  for (const stage of stateReport) {
    if (!["pass", "revise", "blocked"].includes(stage.status)) {
      fail(`state transition ${stage.name} has invalid status: ${stage.status}`);
    }
    if (stage.status === "blocked") {
      fail(`state transition blocked: ${stage.name}`);
    }
  }
}

function main() {
  if (!fs.existsSync(runDir)) {
    fail(`run directory does not exist: ${runDir}`);
  } else {
    validateRequiredArtifacts();
    validateClassification();
    validateHandoffManifest();
    validateStartupPrompt();
    validateAcceptanceCriteria();
    validateRunSummary();
    validateStateTransitions();
  }

  const result = {
    runDir,
    status: failures.length === 0 ? "pass" : "fail",
    failures,
    warnings,
    state_report: stateReport
  };

  console.log(JSON.stringify(result, null, 2));
  process.exit(failures.length === 0 ? 0 : 1);
}

main();
