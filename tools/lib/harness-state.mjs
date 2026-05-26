export const stateSequence = [
  "HARNESS_MAKER_INTAKE",
  "DEEP_INTERVIEW_GATE",
  "INTAKE_NORMALIZATION",
  "VARIANT_CLASSIFICATION",
  "OPTIONAL_KIMI_COLLABORATOR_CRITIQUE",
  "PM_LEVEL_ITERATIVE_DEBATE",
  "HARNESS_CHANGE_SYNTHESIS",
  "CSO_REVIEW",
  "QA_REVIEW",
  "HANDOFF_READINESS",
  "OPERATOR_DECISION",
  "COMPOUND_EXTRACTION",
  "PACKAGE_OUTPUTS",
  "ARCHIVE_SUMMARY"
];

export const allowedStageStatuses = ["pass", "revise", "blocked"];

export function buildStateReport({ classification, exists, read }) {
  const safeClassification = classification ?? {};

  return [
    stage("HARNESS_MAKER_INTAKE", exists("intake.md")),
    stage("DEEP_INTERVIEW_GATE", safeClassification.deep_interview_required ? exists("deep-interview/summary.yaml") : true, safeClassification.deep_interview_required ? "used" : "skipped"),
    stage("INTAKE_NORMALIZATION", exists("intake.md") && exists("classification.yaml")),
    stage("VARIANT_CLASSIFICATION", Boolean(safeClassification.harness_variant && safeClassification.purpose_variant)),
    stage("OPTIONAL_KIMI_COLLABORATOR_CRITIQUE", safeClassification.kimi_cli_decision === "use" ? exists("kimi/collaborator-critique.yaml") : true, safeClassification.kimi_cli_decision === "use" ? "used" : "skipped"),
    stage("PM_LEVEL_ITERATIVE_DEBATE", safeClassification.kimi_cli_decision === "use" ? exists("pm-debate/debate-summary.yaml") : true, safeClassification.kimi_cli_decision === "use" ? "used" : "skipped"),
    stage("HARNESS_CHANGE_SYNTHESIS", exists("proposal/harness-change-proposal.md")),
    reviewStage("CSO_REVIEW", "reviews/cso-review.md", exists, read),
    reviewStage("QA_REVIEW", "reviews/qa-review.md", exists, read),
    stage("HANDOFF_READINESS", exists("handoff/startup-prompt.md") && exists("handoff/required-files.yaml")),
    stage("OPERATOR_DECISION", exists("handoff/operator-checklist.md")),
    stage("COMPOUND_EXTRACTION", safeClassification.compound_extraction_required ? exists("compound/operator-approval-candidates.yaml") : true, safeClassification.compound_extraction_required ? "used" : "skipped"),
    stage("PACKAGE_OUTPUTS", exists("handoff/downstream-chat-brief.md") && exists("handoff/operator-checklist.md")),
    stage("ARCHIVE_SUMMARY", exists("archive/run-summary.md"))
  ];
}

function stage(name, condition, mode = "required") {
  const status = typeof condition === "string"
    ? normalizeStatus(condition)
    : condition ? "pass" : "blocked";

  return {
    name,
    mode,
    status
  };
}

function reviewStage(name, file, exists, read) {
  if (!exists(file)) return stage(name, "blocked");
  const text = read(file);
  const match = text.match(/^status:\s*(pass|revise|blocked)\s*$/im);
  return stage(name, match ? match[1].toLowerCase() : "blocked");
}

function normalizeStatus(value) {
  const status = value.toLowerCase();
  return allowedStageStatuses.includes(status) ? status : "blocked";
}
