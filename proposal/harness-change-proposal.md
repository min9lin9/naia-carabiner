# Harness Change Proposal

Status: ready for operator review

## Requested Change

Package the newly created harness-maker contract into a downstream handoff packet so another chat or work session can operate this workspace as a harness-making harness.

## Proposal

Use `docs/harness/harness-maker-harness.md` as the canonical local contract for harness-making runs. Use `docs/harness/templates/prompts/harness-maker.md` as the startup prompt for sessions that create, modify, or package harnesses.

This package does not add external integrations. It prepares local run artifacts only.

## Source Files Inspected

- `AGENTS.md`
- `README.md`
- `required-files.yaml`
- `docs/harness/harness-maker-harness.md`
- `docs/harness/deep-interview-intake-protocol.md`
- `docs/harness/compound-extraction-protocol.md`
- `docs/harness/research-reference-corpus.md`
- `docs/harness/harness-reference-and-variant-policy.md`
- `docs/harness/kimi-pm-linear-paperclip-harness-spec.md`
- `docs/harness/kimi-pm-linear-paperclip-harness-bootstrap-handoff-run.md`
- `docs/harness/templates/prompts/harness-maker.md`
- `docs/harness/templates/prompts/research-lead.md`
- `docs/superpowers/specs/2026-05-20-research-lead-agent-design.md`

## Authority Impact

- Linear remains the final source of truth for decisions and approvals.
- Paperclip remains the source of truth for runtime and operational governance.
- GitHub remains the source of truth for code artifacts when code changes exist.
- Local output artifacts are handoff material, not official external records.

## Role Impact

Research Lead remains coordinator-only. PM debate, Synthesizer, CSO, and QA remain separate. KIMI remains optional collaborator work product and does not replace any role or approval gate.

## Deep Interview Impact

Ambiguous requests now pass through a Research Lead Deep Interview gate after the first-action classification and before KIMI collaborator critique or PM-level debate.

The gate asks one question at a time and exits when goal, scope, constraints, completion criteria, existing context and impact surface, and open questions are clear enough to route. Clear work records a skip reason instead of running an unnecessary interview.

## Compound Extraction Impact

Compound Extraction is now restored as the learning loop after operator decision and before final archive.

Meaningful runs record `compound_extraction_required: true` and produce reusable lessons, proposed future rules, recurring failure patterns, and operator approval candidates. Compound output is proposed-only and cannot activate canonical rules automatically.

The validator now enforces this governance rule from parsed YAML: every Compound approval candidate must remain `status: proposed` until operator approval. The `invalid-compound-active` fixture confirms that an `active` candidate fails validation.

## Frontier Validation Impact

The validation layer now uses a local YAML parser plus schema-lite checks instead of regex-only field checks.

The state transition runner emits each harness checkpoint as `pass`, `revise`, or `blocked` and fails pre-handoff when any stage is not `pass`.

The research-quality evaluator checks source freshness/source-date policy, evidence table policy, fact/estimate/judgment separation, and uncertainty or confidence language for research and bootstrap handoff runs.

The pre-handoff gate makes `npm run validate:current` mandatory for the current package before state and research-quality checks.

## Reference Corpus Impact

Research harness work now has an explicit corpus policy. The upstream foundation prompt `/Users/burt/Documents/Codex/2026-05-15/gpt-5-5-prompt-enhancement-users/prompt-versions/ai-harness-prompt.v1.4.1.md` and `/Users/burt/Documents/Codex/2026-05-18/2-kimi-cli-pm-linear-ai/docs/` must be considered when designing research harness behavior.

The docs root must not be treated as bio BD-only. Global BD formats are retained as rigor and synthesis precedents, while finance research, company research, industry/market research, free global reports, and operator-facing decision briefs are required format families for general-purpose research harness design.

## KIMI Debate Impact

KIMI-active runs now require two KIMI phases:

1. KIMI collaborator critique once after intake and classification.
2. KIMI PM participation in iterative PM debate after the critique.

The PM-level debate loop continues until no participant has additional questions and all participants are ready for synthesis, or until the hard cap of 20 rounds. If the cap is reached, unresolved questions are preserved for Synthesizer, CSO, QA, and operator review.

## Acceptance Criteria

- A new chat can read the handoff packet and start with the required classification.
- Required files are listed and path-resolvable.
- Deep Interview intake rules are listed and path-resolvable.
- Compound Extraction rules are listed and path-resolvable.
- Research reference corpus requirements are listed and path-resolvable.
- KIMI-active research or harness-making runs require collaborator critique plus PM-level iterative debate.
- Startup prompt repeats authority, source-of-truth, KIMI, and stop-rule boundaries.
- Operator checklist identifies approval gates before external writes or canonical changes.
- Compound proposed future rules remain proposed until operator approval.
- Validation confirms no missing referenced paths.
- YAML parser backed schema validation confirms structured run artifacts.
- State transition runner confirms every checkpoint returns `pass`, `revise`, or `blocked` and current handoff stages are all `pass`.
- Research-quality evaluator confirms source freshness/source-date policy, evidence table policy, fact/estimate/judgment separation, and uncertainty language.
- Pre-handoff gate requires `npm run validate:current` before handoff readiness.

## Open Questions

- Whether future runs should generate machine-validated schemas for proposal and review artifacts.
- Whether the output package should be mirrored into a separate export directory for downstream chats.
