# Harness Maker Harness

Status: active canonical
Role: meta-harness contract
Scope: `/Users/burt/Documents/har-maker`

## Purpose

This document defines the harness-making harness: a local operating contract for creating, changing, packaging, and handing off PM research harnesses.

The harness-making harness is not the downstream research harness. It produces reviewed harness packages, implementation-ready handoff packets, startup prompts, schemas, fixtures, and change proposals for another chat or work session.

## Core Rule

Do not run an unbounded self-development loop.

The harness may inspect its own documents, identify gaps, propose changes, package handoff artifacts, and prepare implementation plans. Actual changes to canonical harness files, external records, adapter behavior, or source-of-truth systems require operator approval.

## Required First Action

Every harness-making run starts with this classification:

```yaml
harness_variant: kimi-active | no-kimi | local-only
variant_source_prompt: string
purpose_variant: research | product_decision | implementation | release | bootstrap_handoff | local_only
task_profile: trivial | normal | ui | runtime | research | high-risk
friction_level: 1 | 2 | 3
kimi_cli_decision: use | skip
kimi_cli_reason: string
deep_interview_required: true | false
deep_interview_reason: string
compound_extraction_required: true | false
compound_extraction_reason: string
```

Use `bootstrap_handoff` when the request packages or changes the harness for downstream use.
Use `local-only` when the request is limited to local documentation, validation, or planning.

## Deep Interview Intake Gate

Use `docs/harness/deep-interview-intake-protocol.md` when the operator request has unclear goal, scope, constraints, completion criteria, or impact surface.

Deep Interview is a Research Lead intake gate. It runs after the initial first-action classification and before final intake normalization, KIMI collaborator critique, PM-level debate, synthesis, CSO review, or QA review.

Do not use Deep Interview for precise edits, typo fixes, small manifest updates, direct validation requests, or other work where asking the operator adds little value.

When Deep Interview runs, ask one question at a time and stop when these are clear enough to route work:

- goal
- included and excluded scope
- constraints
- completion criteria
- existing context and impact surface
- open questions

## Authority Model

- Linear remains the source of truth for final results, decisions, approvals, risk acceptance, assumptions, and summaries.
- Paperclip remains the source of truth for agent runtime, run status, transcripts, waiting states, and operational governance.
- GitHub remains the source of truth for code artifacts, PRs, checks, diffs, commits, and validation evidence when code changes.
- KIMI may provide trusted collaborator work product, but it is not the official record.
- Local files in this workspace are draft or canonical harness artifacts depending on their status header and manifest registration.

## Compound Extraction

Use `docs/harness/compound-extraction-protocol.md` for meaningful harness-making runs.

Compound Extraction is the learning loop. It extracts reusable lessons, recurring failure patterns, and proposed future rules after CSO/QA review and operator decision. It may propose improvements, but it must not activate canonical rules automatically.

Default `compound_extraction_required: true` for research, product decision, implementation, release, bootstrap handoff, and friction level 2 or 3 runs. Default `false` only for trivial local-only work, precise local edits, direct validation, or small manifest-only changes.

When Compound Extraction runs, write `compound/reusable-lessons.md`, `compound/proposed-future-rules.md`, `compound/recurring-failure-patterns.md`, and `compound/operator-approval-candidates.yaml`.

## KIMI PM Debate Protocol

KIMI-active research and harness-making runs must use `docs/harness/kimi-pm-iterative-debate-protocol.md`.

KIMI has two distinct phases:

1. One-time collaborator critique after intake and variant classification.
2. PM-level iterative debate participant after the collaborator critique.

The PM-level debate loop continues until no participant has additional questions, or until the loop reaches the hard cap of 20 rounds.

The Research Lead moderates the loop. KIMI PM may ask questions, challenge assumptions, and state a PM-level position, but KIMI does not replace PM debate participants, Synthesizer, CSO, QA, Linear, Paperclip, or operator approval.

Each loop must record participant `ready_for_synthesis` values and final `round_cap_reached` status before handoff to Synthesizer.

## Research Reference Corpus

Research harness work must use `docs/harness/research-reference-corpus.md`.

The corpus includes the upstream foundation prompt `/Users/burt/Documents/Codex/2026-05-15/gpt-5-5-prompt-enhancement-users/prompt-versions/ai-harness-prompt.v1.4.1.md` and `/Users/burt/Documents/Codex/2026-05-18/2-kimi-cli-pm-linear-ai/docs/` as required references. That docs root must be treated as a general research-harness source, not as bio BD-only material.

When building a research harness, consider at least these format families:

- global BD research formats
- finance research formats
- company research formats
- industry or market research formats
- free global report formats
- operator-facing decision briefs

If a research harness omits finance, company, or free global-report references, the run must record the omission reason.

## Roles

### Research Lead

Coordinator only.

Responsibilities:

- normalize the harness-making request
- classify task profile, friction, purpose, and variant
- decide whether KIMI CLI should be used
- prepare the Harness Change Proposal
- route PM debate, Synthesizer, CSO, and QA work
- prepare handoff readiness
- prepare downstream handoff packets

The Research Lead does not replace reviewers, make final operator decisions, write real Linear records, or archive Paperclip records without approval.

### PM Debate

Separate Market/Opportunity PM and Execution/Risk PM perspectives.

Responsibilities:

- evaluate whether the harness change is worth making
- expose product, workflow, adoption, and execution risks
- identify unresolved disagreements for the operator

### Synthesizer

Responsibilities:

- turn debate outputs into a coherent Harness Change Proposal
- preserve unresolved questions instead of hiding disagreement
- produce affected-file, acceptance-criteria, and rollback summaries

### CSO

Responsibilities:

- review strategic coherence and governance risk
- check source-of-truth boundaries
- reject changes that create unbounded self-modification or unclear authority

### QA

Responsibilities:

- validate artifact completeness
- check required fields and referenced paths
- confirm handoff packet usability
- report findings rather than silently editing review outputs

## State Machine

```text
HARNESS_MAKER_INTAKE
  -> DEEP_INTERVIEW_GATE
  -> INTAKE_NORMALIZATION
  -> VARIANT_CLASSIFICATION
  -> OPTIONAL_KIMI_COLLABORATOR_CRITIQUE
  -> PM_LEVEL_ITERATIVE_DEBATE
  -> HARNESS_CHANGE_SYNTHESIS
  -> CSO_REVIEW
  -> QA_REVIEW
  -> HANDOFF_READINESS
  -> OPERATOR_DECISION
  -> COMPOUND_EXTRACTION
  -> PACKAGE_OUTPUTS
  -> ARCHIVE_SUMMARY
```

Allowed terminal states:

```text
READY_FOR_HANDOFF
REVISE_PACKAGE
BLOCKED
ARCHIVED_WITHOUT_ACTION
```

Every non-terminal checkpoint returns:

```yaml
status: pass | revise | blocked
summary: string
required_changes:
  - string
artifacts:
  - name: string
    path_or_url: string
```

## Standard Run Outputs

Each harness-making run should write local artifacts under:

```text
output/harness-runs/<run-id>/harness-maker/
  intake.md
  classification.yaml
  deep-interview/
    questions.yaml
    summary.yaml
  proposal/
    harness-change-proposal.md
    affected-files.yaml
    acceptance-criteria.yaml
    rollback-plan.md
  kimi/
    collaborator-critique.yaml
  pm-debate/
    rounds/
      round-01.yaml
    debate-summary.yaml
  reviews/
    cso-review.md
    qa-review.md
  compound/
    reusable-lessons.md
    proposed-future-rules.md
    recurring-failure-patterns.md
    operator-approval-candidates.yaml
  handoff/
    downstream-chat-brief.md
    required-files.yaml
    startup-prompt.md
    operator-checklist.md
  archive/
    run-summary.md
```

Small local documentation changes may skip full run artifact creation when the operator approves direct file edits.

## Executable Validation

Use the pre-handoff gate before claiming a harness run is ready for handoff:

```bash
npm run prehandoff:current
```

The pre-handoff gate makes `npm run validate:current` mandatory for the current package, then runs state-transition and research-quality checks.

Use `tools/validate-harness-run.mjs` for direct run validation.

Default current-run validation:

```bash
npm run validate:current
```

Specific run validation:

```bash
npm run validate:harness-run -- output/harness-runs/<run-id>/harness-maker
```

The validator parses YAML artifacts, validates them against local schema targets, checks required artifacts, classification fields, Deep Interview use or skip reason, KIMI-active debate artifacts when applicable, Compound Extraction artifacts when required, handoff manifest paths, startup prompt terms, acceptance criteria status, and archive validation wording.

The state runner emits each checkpoint as `pass`, `revise`, or `blocked` and fails pre-handoff when any stage is not `pass`.

The Compound governance check requires every `compound/operator-approval-candidates.yaml` candidate to remain `status: proposed` until operator approval.

The research-quality evaluator checks source freshness/source-date policy, evidence table policy, fact/estimate/judgment separation, and uncertainty or confidence language for research and bootstrap handoff runs.

Schema targets live under `schemas/harness-run/`. Regression fixtures live under `fixtures/harness-runs/`.

## Harness Change Proposal

A proposal must include:

- requested change
- normalized goal
- variant classification
- deep interview decision and summary when intake was ambiguous
- reference corpus selection when the work affects research harness behavior
- source files inspected
- affected canonical files
- affected prompt templates
- source-of-truth impact
- role-boundary impact
- KIMI CLI decision and reason
- acceptance criteria
- validation evidence
- rollback plan
- open questions

## Handoff Packet

The primary durable output is a downstream handoff packet for another chat or work session.

Required sections:

- Harness purpose
- Current operating assumptions
- Required source files
- Agent roles
- State machine summary
- Variant and KIMI trust model
- Linear/Paperclip/GitHub responsibility split
- First action checklist
- Operator approval gates
- Known limits

## Stop Rules

Stop and ask the operator before:

- writing real Linear or Paperclip records
- changing external systems
- accepting strategic, security, compliance, or product risk
- letting KIMI replace PM debate, Synthesizer, CSO, QA, or operator approval
- modifying canonical harness files without explicit approval
- continuing a self-improvement loop without a concrete handoff target

## Acceptance Criteria

The harness-making harness is working when:

- every run starts with the required classification
- every run records KIMI use or skip reason
- Research Lead remains coordinator-only
- role separation is preserved
- proposed changes identify affected files and rollback path
- handoff packets are sufficient for a new chat to continue without replaying the full design process
- official records are not written without operator approval
