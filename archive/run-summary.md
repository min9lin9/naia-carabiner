# Run Summary

Run ID: `2026-05-20-harness-maker-bootstrap`
Terminal state: `READY_FOR_HANDOFF`

## Summary

Created a local handoff package for operating `/Users/burt/Documents/har-maker` as a harness-making harness. The package is file-based and does not write external records.

Updated the package to include `docs/harness/research-reference-corpus.md` so future research harness work considers global BD, finance, company, industry/market, free global-report, and operator-facing decision brief formats.

Updated the package to include `docs/harness/kimi-pm-iterative-debate-protocol.md` so KIMI-active runs use KIMI first as a one-time collaborator critique, then as a PM-level iterative debate participant until no additional questions remain or the 20-round cap is reached.

Updated the package to include `docs/harness/deep-interview-intake-protocol.md` so ambiguous requests are clarified one question at a time before KIMI critique, PM-level debate, synthesis, CSO review, or QA review.

Updated the package with `tools/validate-harness-run.mjs`, schema targets under `schemas/harness-run/`, and regression fixtures under `fixtures/harness-runs/`.

Updated the package to restore Compound Extraction as the post-operator-decision learning loop. The current run now includes reusable lessons, proposed future rules, recurring failure patterns, and operator approval candidates.

Updated the frontier validation layer with parser-backed schema validation, a state transition runner, a Compound proposed-only governance check, a research-quality evaluator, and a pre-handoff gate that requires `npm run validate:current`.

## Key Outputs

- `classification.yaml`
- `proposal/harness-change-proposal.md`
- `reviews/cso-review.md`
- `reviews/qa-review.md`
- `handoff/downstream-chat-brief.md`
- `handoff/required-files.yaml`
- `handoff/startup-prompt.md`
- `handoff/operator-checklist.md`

## Decisions

- Variant: local-only
- Purpose: bootstrap_handoff
- KIMI CLI: skipped
- External records: none written

## Validation

Executable validation passed after the Frontier Upgrade: `npm run validate:current`, `npm run state:current`, `npm run research-quality:current`, `npm run prehandoff:current`, and `npm run validate:fixtures` returned pass. The negative fixtures returned expected failures for missing `deep_interview_reason` and for an active Compound approval candidate.
