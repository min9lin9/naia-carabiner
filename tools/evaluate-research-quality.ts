#!/usr/bin/env node
// @ts-nocheck
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parseYamlFile } from "./lib/yaml-lite.ts";

const root = process.cwd();
const defaultRunDir = "output/harness-runs/2026-05-20-harness-maker-bootstrap/harness-maker";
const runDir = path.resolve(root, process.argv[2] || defaultRunDir);
const failures = [];
const warnings = [];

const checks = [
  {
    id: "source_freshness",
    description: "Research runs require source freshness or source-date handling.",
    patterns: [/source freshness/i, /source dates?/i, /dates and links/i, /as[- ]of/i]
  },
  {
    id: "evidence_table",
    description: "Research outputs require an evidence table policy.",
    patterns: [/evidence table/i, /source quality and date/i]
  },
  {
    id: "fact_estimate_judgment",
    description: "Research outputs must separate fact, estimate, and judgment.",
    patterns: [/facts?, estimates?, and judgment/i, /fact\/estimate\/judgment/i, /fact.*estimate.*judgment/i]
  },
  {
    id: "uncertainty_language",
    description: "Research outputs require assumptions, confidence, or uncertainty language.",
    patterns: [/uncertainty/i, /confidence/i, /assumptions?/i]
  }
];

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function readIfExists(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function walkTextFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkTextFiles(fullPath));
    } else if (/\.(md|yaml|yml)$/i.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function loadClassification() {
  const file = path.join(runDir, "classification.yaml");
  if (!fs.existsSync(file)) return {};
  try {
    return parseYamlFile(file);
  } catch (error) {
    fail(`classification.yaml YAML parse failed: ${error.message}`);
    return {};
  }
}

function shouldEvaluateResearchQuality(classification) {
  return [
    "research",
    "product_decision",
    "bootstrap_handoff"
  ].includes(classification.purpose_variant) || classification.task_profile === "research";
}

function main() {
  if (!fs.existsSync(runDir)) fail(`run directory does not exist: ${runDir}`);

  const classification = loadClassification();
  const required = shouldEvaluateResearchQuality(classification);
  const corpusPath = path.join(root, "docs/harness/research-reference-corpus.md");
  const searchableFiles = [
    corpusPath,
    ...walkTextFiles(runDir)
  ];
  const searchableText = searchableFiles.map(readIfExists).join("\n\n");
  const results = checks.map((check) => ({
    id: check.id,
    description: check.description,
    status: check.patterns.some((pattern) => pattern.test(searchableText)) ? "pass" : "fail"
  }));

  for (const result of results) {
    if (result.status !== "pass" && required) {
      fail(`research quality check failed: ${result.id}`);
    } else if (result.status !== "pass") {
      warn(`research quality check not evidenced for non-research run: ${result.id}`);
    }
  }

  const report = {
    runDir,
    required,
    status: failures.length === 0 ? "pass" : "fail",
    failures,
    warnings,
    checks: results
  };

  console.log(JSON.stringify(report, null, 2));
  process.exit(failures.length === 0 ? 0 : 1);
}

main();
