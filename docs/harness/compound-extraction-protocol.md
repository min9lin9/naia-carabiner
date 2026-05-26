# Compound Extraction Protocol

Status: active canonical
Role: learning loop protocol
Scope: `/Users/burt/Documents/har-maker`

## Purpose

Compound Extraction turns each meaningful harness-making run into reusable operating knowledge.

It extracts lessons, recurring failure patterns, and candidate future rules after CSO/QA review and operator decision. It does not activate new canonical rules by itself.

## Core Rule

Compound Extraction may propose future harness improvements, but it must not apply them automatically.

Any proposed rule, workflow change, schema change, adapter change, prompt change, or source-of-truth policy change requires operator approval before becoming canonical.

## Placement In The Harness

Compound Extraction runs after operator decision and before final archive:

```text
CSO_REVIEW
  -> QA_REVIEW
  -> HANDOFF_READINESS
  -> OPERATOR_DECISION
  -> COMPOUND_EXTRACTION
  -> PACKAGE_OUTPUTS
  -> ARCHIVE_SUMMARY
```

This placement ensures Compound sees the final artifacts, review findings, validation evidence, revision count, and operator decision.

## Required Decision

Every run records:

```yaml
compound_extraction_required: true | false
compound_extraction_reason: string
```

Default to `true` for:

- `purpose_variant: research`
- `purpose_variant: product_decision`
- `purpose_variant: implementation`
- `purpose_variant: release`
- `purpose_variant: bootstrap_handoff`
- `friction_level: 2`
- `friction_level: 3`

Default to `false` for:

- `purpose_variant: local_only` with `task_profile: trivial`
- precise local edits
- direct validation requests
- small manifest-only changes

When skipped, record the reason.

## Inputs

Compound Extraction consumes:

- normalized intake
- classification
- Deep Interview summary or skip reason
- KIMI collaborator critique when present
- PM debate summary when present
- Harness Change Proposal
- CSO review
- QA review
- validation results
- operator decision
- final handoff packet

## Outputs

Required artifact layout when `compound_extraction_required: true`:

```text
compound/
  reusable-lessons.md
  proposed-future-rules.md
  recurring-failure-patterns.md
  operator-approval-candidates.yaml
```

### `reusable-lessons.md`

Lessons that should help future harness-making runs.

### `proposed-future-rules.md`

Candidate rules that may become canonical after operator approval.

### `recurring-failure-patterns.md`

Repeated failure modes, missing gates, ambiguity patterns, or validation gaps.

### `operator-approval-candidates.yaml`

Machine-readable list of proposed changes that require human approval.

Required shape:

```yaml
approval_candidates:
  - id: string
    proposal: string
    reason: string
    affected_files:
      - string
    risk_level: low | medium | high
    status: proposed
```

## Validation Rules

A run requiring Compound Extraction is not ready for archive unless:

- all four compound artifacts exist
- `operator-approval-candidates.yaml` contains `approval_candidates`
- proposed rules are marked as proposed, not active
- archive summary mentions Compound Extraction
- no compound artifact claims automatic canonical activation

## Stop Rules

Stop before:

- activating any proposed rule
- editing canonical files based only on Compound output
- writing external records based only on Compound output
- hiding unresolved disagreements as lessons
- turning one-off preferences into global rules without evidence
