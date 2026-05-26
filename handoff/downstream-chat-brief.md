# Downstream Chat Brief

## Harness Purpose

This workspace builds, changes, packages, and hands off PM research harnesses. It is a harness-making workspace, not the final downstream project workspace.

## Current Operating Assumptions

- The canonical meta-harness contract is `docs/harness/harness-maker-harness.md`.
- The Deep Interview intake protocol is `docs/harness/deep-interview-intake-protocol.md`.
- The Compound Extraction protocol is `docs/harness/compound-extraction-protocol.md`.
- The canonical research reference corpus policy is `docs/harness/research-reference-corpus.md`.
- The KIMI debate protocol is `docs/harness/kimi-pm-iterative-debate-protocol.md`.
- The startup prompt for this mode is `docs/harness/templates/prompts/harness-maker.md`.
- Research Lead is coordinator-only.
- Operator approval is required for canonical changes and external records.

## Required Source Files

Read `handoff/required-files.yaml` first, then inspect all `required: true` files before routing work.

## Agent Roles

- Research Lead: intake, classification, routing, handoff readiness.
- PM Debate: separate Market/Opportunity and Execution/Risk perspectives.
- Synthesizer: coherent proposal and unresolved questions.
- CSO: strategy, authority, and governance review.
- QA: artifact completeness and validation review.

## State Machine Summary

```text
HARNESS_MAKER_INTAKE
  -> VARIANT_CLASSIFICATION
  -> OPTIONAL_KIMI_CRITIQUE
  -> PM_DEBATE
  -> HARNESS_CHANGE_SYNTHESIS
  -> CSO_REVIEW
  -> QA_REVIEW
  -> HANDOFF_READINESS
  -> OPERATOR_DECISION
  -> PACKAGE_OUTPUTS
  -> ARCHIVE_SUMMARY
```

## Variant And KIMI Trust Model

Use KIMI-active mode only when KIMI CLI is useful and allowed. Use no-KIMI when requested or required by privacy, policy, cost, or availability constraints. Use local-only for local documentation, validation, and handoff packaging. KIMI output is trusted collaborator work product, not the official record.

## KIMI PM Debate Structure

For KIMI-active research or harness-making runs:

1. Research Lead performs intake and variant classification.
2. KIMI produces one collaborator critique.
3. Market/Opportunity PM, Execution/Risk PM, and KIMI PM enter iterative debate.
4. Each round records positions, evidence, questions, additional questions, and readiness for synthesis.
5. The loop continues until every participant has no additional questions and is ready for synthesis.
6. The loop hard-stops at 20 rounds.
7. Research Lead records participant `ready_for_synthesis` values and final `round_cap_reached` status.
8. If the cap is reached, unresolved questions are preserved and passed to Synthesizer, CSO, QA, and operator review.

KIMI PM may challenge and ask PM-level questions. KIMI PM cannot make final decisions or replace Synthesizer, CSO, QA, Linear, Paperclip, or operator approval.

## Compound Extraction

Compound Extraction runs after operator decision for meaningful runs. It extracts reusable lessons, proposed future rules, recurring failure patterns, and operator approval candidates.

Required outputs when `compound_extraction_required: true`:

- `compound/reusable-lessons.md`
- `compound/proposed-future-rules.md`
- `compound/recurring-failure-patterns.md`
- `compound/operator-approval-candidates.yaml`

Compound may propose future rules, but it cannot activate canonical changes automatically.

## Research Reference Corpus

Research harness work must inspect `docs/harness/research-reference-corpus.md`.

Required external source handles:

- `references/upstream/ai-harness-prompt.v1.4.1.md`
- `references/upstream/2-kimi-cli-pm-linear-ai/docs/`

The second source is not bio BD-only. It must be considered for cockpit architecture, source policy, object model, state machine, validation, view model, output discipline, and research format precedents. If an external source is not included in the transferred bundle, record it as `source_missing` instead of inventing a machine-local absolute path.

For general research harnesses, consider global BD, finance, company, industry/market, free global-report, and operator-facing decision brief formats.

## Source Of Truth Split

- Linear: final results, decisions, approvals, risk acceptance, assumptions, summaries.
- Paperclip: runtime status, transcripts, waiting states, operational governance.
- GitHub: code artifacts, PRs, checks, diffs, commits, validation evidence.
- Local files: draft and canonical harness artifacts depending on status headers and manifest registration.

## How To Start

Use `handoff/startup-prompt.md` in a new chat. The first response must classify the run with `harness_variant`, `variant_source_prompt`, `purpose_variant`, `task_profile`, `friction_level`, `kimi_cli_decision`, `kimi_cli_reason`, `deep_interview_required`, `deep_interview_reason`, `compound_extraction_required`, and `compound_extraction_reason`.

If the request is ambiguous, Research Lead runs Deep Interview before KIMI collaborator critique or PM-level debate. The interview asks one question at a time and stops when goal, scope, constraints, completion criteria, and open questions are clear enough to route.

## Known Limits

- No real Linear, Paperclip, GitHub, or KIMI integration was exercised in this package.
- This package is local-file based.
- This workspace is not a git repo, so validation evidence is file-based rather than commit-based.
