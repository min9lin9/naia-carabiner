# KIMI PM Harness Bootstrap and Handoff Run

Status: draft v0.1
Date: 2026-05-20
Related:

- `docs/harness/kimi-pm-linear-paperclip-harness-spec.md`
- `docs/harness/kimi-pm-linear-paperclip-harness-assessment.md`
- `docs/superpowers/specs/2026-05-20-research-lead-agent-design.md`
- `docs/harness/templates/prompts/research-lead.md`

## Goal

Use the research harness to create a usable harness package that can be handed off to another chat or work session. A Bootstrap and Handoff Run turns harness requirements into reviewed operating documents, prompt templates, schemas, fixtures, and an implementation-ready handoff packet.

## Core Rule

Do not design this as an unlimited self-development loop.

The harness may inspect its own documents, critique them, propose improvements, and package implementation-ready artifacts. It should not assume it can recursively improve itself without human judgment. Actual rule, prompt, schema, adapter, or workflow changes require operator approval.

The primary output is a handoff package for another chat or agent session, not autonomous self-modification.

## When To Use

Use a Harness Development Run for:

- adding or changing agent roles
- changing Research Lead behavior
- changing KIMI CLI routing
- changing Linear or Paperclip object models
- changing prompt templates
- changing adapter contracts
- changing idempotency, event, timeout, or authority rules
- adding fixtures or validation rules
- introducing new GStack or Compound Engineering gates
- packaging the harness for use in a separate chat
- producing handoff packets for implementation or downstream research work

Do not use it for:

- small typo fixes
- purely local formatting
- one-off research output changes
- project-specific decisions that do not affect the harness
- open-ended self-improvement without a concrete handoff target

## Task Profile

Default profile:

```yaml
task_profile: research
friction_level: 2
```

Escalate to Level 3 when the change touches:

- credentials or secrets
- production deployment
- irreversible automation
- external publishing
- real Linear write behavior
- real Paperclip run governance
- authority matrix changes
- KIMI full-access execution semantics

## Agent Roles

### Research Lead

Role: coordinator.

Responsibilities:

- normalize the improvement request
- classify task profile and friction level
- decide whether KIMI CLI is used
- create the Harness Change Proposal
- route to PM debate, Synthesizer, CSO, QA, and Compound Extraction
- prepare publish readiness
- prepare a downstream handoff packet

The Research Lead does not apply harness changes directly and does not run an unbounded self-development loop.

### KIMI CLI

Role: trusted full-access collaborator.

KIMI should be considered by default for Harness Development Runs because harness changes are planning-heavy and benefit from independent critique.

Allowed work:

- critique the current harness spec
- identify missing contracts
- propose implementation sequence
- inspect related docs and code
- draft schema, template, fixture, or controller changes
- provide independent risk review

Boundary:

- KIMI output does not replace PM debate, CSO, QA, Linear records, Paperclip records, or operator approval.
- If KIMI conflicts with existing harness rules or user direction, Research Lead prepares a Human Decision Packet.

### Market/Opportunity PM

Role: value and leverage reviewer.

Reviews whether the proposed harness change improves:

- research quality
- planning quality
- decision quality
- operator leverage
- reuse across future runs
- speed without sacrificing governance

### Execution/Risk PM

Role: feasibility and complexity reviewer.

Reviews whether the proposed harness change creates:

- implementation complexity
- fragile state transitions
- duplicate source-of-truth records
- unclear authority
- extra ceremony without quality gain
- validation burden

### Synthesizer

Role: proposal author.

Merges PM debate and KIMI critique into a Harness Change Proposal.

### CSO

Role: strategic governance review.

Approves only if the change improves focus, operating leverage, or decision quality enough to justify added complexity.

### QA

Role: validation review.

Approves only if the change has observable acceptance criteria, fixtures, and rollback/recovery behavior.

### Compound Extraction

Role: learning loop.

Extracts reusable rules after the run. It may propose future harness improvements, but it must not activate them automatically. For bootstrap work, Compound Extraction is limited to packaging lessons that improve the handoff packet.

## State Machine

```text
BOOTSTRAP_INTAKE
  -> KIMI_CRITIQUE
  -> PM_DEBATE
  -> HARNESS_PACKAGE_SYNTHESIS
  -> CSO_REVIEW
  -> QA_REVIEW
  -> HANDOFF_READINESS
  -> OPERATOR_DECISION
  -> COMPOUND_EXTRACTION
  -> ARCHIVE
```

Allowed terminal states:

```text
READY_FOR_HANDOFF
REVISE_HANDOFF_PACKAGE
BLOCKED
ARCHIVED_WITHOUT_ACTION
```

## Artifacts

Each run writes to:

```text
output/harness-runs/<run-id>/harness-development/
  intake.md
  kimi-critique.md
  pm-debate/
    market-opportunity.md
    execution-risk.md
    debate-summary.md
  proposal/
    harness-package-proposal.md
    affected-files.yaml
    acceptance-criteria.yaml
    rollback-plan.md
  reviews/
    cso-review.md
    qa-review.md
  readiness/
    handoff-readiness-report.md
    human-decision-packet.yaml
  handoff/
    downstream-chat-brief.md
    required-files.yaml
    startup-prompt.md
    operator-checklist.md
  compound/
    reusable-lessons.md
    proposed-future-rules.md
  archive/
    run-summary.md
```

## Harness Package Proposal

Required sections:

- Proposed harness package
- Problem it solves
- Current behavior
- Desired behavior
- Affected harness files
- Affected agents
- Affected external systems
- KIMI CLI role
- Linear impact
- Paperclip impact
- Mirage impact
- GStack impact
- Compound Engineering impact
- Complexity added
- Complexity removed
- Alternatives considered
- Rejected alternatives
- Acceptance criteria
- Validation plan
- Rollback or recovery plan
- Downstream handoff plan
- Open questions

Quality bar:

- State why the change belongs in the harness instead of a one-off run.
- State what would become simpler after the change.
- State what new failure mode the change introduces.
- State how the change can be tested without real Linear or Paperclip writes.
- State how another chat should consume the handoff packet.

## Handoff Packet

The handoff packet is the main product of this run.

Required files:

```text
handoff/
  downstream-chat-brief.md
  required-files.yaml
  startup-prompt.md
  operator-checklist.md
```

### `downstream-chat-brief.md`

Purpose: give a new chat enough context to use the harness without replaying the whole design process.

Required sections:

- Harness purpose
- Current operating assumptions
- Required source files
- Agent roles
- State machine summary
- KIMI CLI trust model
- Linear/Paperclip responsibility split
- How to start the first real research run
- Known limits

### `required-files.yaml`

Purpose: list the files the downstream chat must read before operating.

Required shape:

```yaml
required_files:
  - path: string
    purpose: string
    required: true
optional_files:
  - path: string
    purpose: string
    required: false
```

### `startup-prompt.md`

Purpose: a compact prompt that can be pasted into a new chat to activate the harness.

Required sections:

- Role
- Goal
- Required files to inspect
- KIMI trust model
- Linear/Paperclip split
- First action
- Stop rules

### `operator-checklist.md`

Purpose: let the operator verify that the new chat is using the harness correctly.

Required checks:

- Reads required files
- Preserves KIMI trusted full-access collaborator semantics
- Uses Research Lead as coordinator
- Keeps Linear as results/decision source of truth
- Keeps Paperclip as run history/control plane
- Does not treat bootstrap as autonomous self-development
- Produces run artifacts before real external writes

## KIMI Critique Packet

KIMI receives:

- current improvement request
- current harness spec
- current Research Lead design
- relevant prompt templates
- existing assessment
- known operator constraints

KIMI returns:

```yaml
status: pass | revise | blocked
summary: string
recommended_change: string
missing_contracts:
  - string
complexity_risks:
  - string
validation_gaps:
  - string
conflicts_with_current_harness:
  - string
implementation_sequence:
  - string
```

## Evidence Gate

Before the change can be approved for implementation, the run must provide:

- Harness Package Proposal
- PM debate summary
- KIMI critique summary
- CSO verdict
- QA verdict
- affected file list
- acceptance criteria
- validation plan
- rollback or recovery plan
- handoff packet
- operator decision packet when needed

Missing evidence blocks completion.

## CSO Gate

Pass only if:

- the change improves strategic focus or operator leverage
- the added complexity is justified
- the change does not blur Linear/Paperclip/KIMI/Mirage responsibilities
- the change preserves mandatory CSO and QA gates where required
- the change does not weaken KIMI trusted collaborator semantics

Return `revise` if:

- value is plausible but the scope is too broad
- the change should be split into smaller phases
- the proposal lacks a clear sequencing argument

Return `blocked` if:

- the change turns the harness into unmanaged ceremony
- the change creates source-of-truth ambiguity
- the change bypasses operator approval for durable side effects

## QA Gate

Pass only if:

- acceptance criteria are observable
- fixtures or validation scenarios are named
- rollback or recovery is defined
- affected files are explicit
- side effects are idempotent or file-only in V0

Return `revise` if:

- acceptance criteria are incomplete
- fixture coverage is too weak
- validation can run locally but is not specified

Return `blocked` if:

- the change cannot be tested
- the change creates unbounded revision loops
- the change can write real Linear or Paperclip records without approval

## Human Decision Protocol

Create a Human Decision Packet when:

- KIMI, PM debate, CSO, QA, or existing harness rules conflict
- the change touches authority boundaries
- the change adds a new external integration
- the change changes real Linear/Paperclip write behavior
- the change requires accepting residual risk

Packet shape:

```yaml
decision_needed: string
options:
  - label: string
    rationale: string
    tradeoffs:
      - string
recommended_option: string
blocking_risk: string
required_by_state: string
```

## Handoff Readiness

The run may be marked ready for handoff only when:

- task profile and friction level are recorded
- KIMI CLI use or skip decision is recorded
- Harness Package Proposal exists
- affected files are listed
- CSO status is `pass`
- QA status is `pass`
- acceptance criteria are concrete
- validation plan can run without real external writes
- rollback or recovery plan exists
- downstream handoff packet exists
- operator decision is recorded when required

## Completion Contract

Do not claim the Harness Development Run is complete unless one terminal state is reached:

- `READY_FOR_HANDOFF`
- `REVISE_HANDOFF_PACKAGE`
- `BLOCKED`
- `ARCHIVED_WITHOUT_ACTION`

For `READY_FOR_HANDOFF`, include:

- summary of the handoff-ready harness package
- affected files
- validation plan
- rollback or recovery plan
- downstream-chat startup prompt
- required files list
- operator checklist

For `BLOCKED`, include:

- blocking reason
- responsible decision owner
- next action

## Recommended Development Order

Use this run type to package the harness in this order:

1. Schemas
2. Prompt templates
3. Fixtures
4. File-based controller
5. Stub adapters
6. Validation command
7. Real Paperclip adapter
8. Real Linear adapter
9. Mirage integration
10. KIMI CLI execution wrapper
11. GStack runner
12. Compound Extraction runner

## Acceptance Criteria

- Harness bootstrap and handoff work has its own state machine.
- KIMI CLI is used as a trusted full-access collaborator by default for meaningful harness changes.
- Research Lead coordinates but does not mutate the harness automatically.
- The run produces a downstream handoff packet for another chat or work session.
- PM debate checks value and execution risk separately.
- CSO and QA gates are mandatory before handoff readiness.
- Every approved change has affected files, acceptance criteria, validation plan, and rollback or recovery plan.
- Real Linear or Paperclip write behavior cannot change without operator decision.
- Compound Extraction can propose future rules but cannot activate them automatically.
- The spec explicitly rejects unlimited recursive self-development.
