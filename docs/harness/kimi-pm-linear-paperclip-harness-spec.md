# KIMI PM Research Harness Design Spec

Status: draft v0.1
Date: 2026-05-18
Owner: Operator

## Goal

Build a research-first planning harness where multiple PM agents debate a product direction, synthesize a single planning artifact, pass mandatory strategy and QA gates, and publish only decisions/results to Linear while preserving agent run history in Paperclip.

Primary research domain profile: Global BD intelligence for a bio broker / bio analyst workflow. The harness should support macro market report style research, deal intelligence, partner screening, and analyst-grade decision packets. See `docs/harness/global-bd-bio-analyst-research-profile.md`.

Industrial cockpit direction: this harness is intended to become the foundation for a Global Bio BD industrial decision cockpit. The cockpit foundation is defined in `docs/harness/industrial-decision-cockpit-foundation.md`.

## Reference and Variant Policy

Harness variants are governed by `docs/harness/harness-reference-and-variant-policy.md`.

Default source prompts:

- KIMI-active: `$CODEX_REFERENCE_ROOT/2026-05-15/gpt-5-5-prompt-enhancement-users/prompt-versions/ai-harness-prompt.v1.4.1.md`
- No-KIMI: `$CODEX_REFERENCE_ROOT/2026-05-15/gpt-5-5-prompt-enhancement-users/prompt-versions/ai-harness-prompt.v1.4.1-no-kimi.md`

Every run must record:

```yaml
harness_variant: kimi-active | no-kimi | local-only
variant_source_prompt: string
purpose_variant: research | product_decision | implementation | release | bootstrap_handoff | local_only
kimi_cli_decision: use | skip
kimi_cli_reason: string
```

## Non-Goals

- Do not use Linear as a transcript store.
- Do not use Paperclip as the business source of truth.
- Do not collapse PM debate, synthesis, strategy review, and QA into one agent.
- Do not treat Mirage as a security sandbox.
- Do not make Compound Engineering the primary workflow controller.

## System Roles

### Linear AI

Role: source of truth for results and decisions.

Linear stores:

- Research Brief final version
- PRD final version
- Linear issue set
- Decision log
- Open questions requiring human decision
- Approval, blocked, revised, or archived state

Linear does not store:

- Full agent transcripts
- Scratch debate notes
- Tool logs
- Raw model output
- Retry traces
- Prompt experiments

### Paperclip

Role: agent run control plane.

Paperclip stores:

- Agent roster
- Run goals
- Heartbeats
- Budgets
- Agent run transcript
- Run status
- Failure and retry history
- Human approvals for sensitive steps

Paperclip should link back to Linear IDs, but Linear should not depend on Paperclip internals.

### KIMI CLI

Role: trusted full-access research and execution worker.

KIMI is a trusted full-access collaborator in this harness, not an untrusted external actor. The harness should be designed so the operator can comfortably delegate real research work to KIMI CLI with full workspace context. Do not treat KIMI output as hostile input.

Trust model:

- KIMI may receive full workspace context for research and planning work.
- KIMI may inspect repo, docs, Linear context, Paperclip run context, and generated artifacts.
- KIMI may create and revise run artifacts without adversarial sandbox assumptions.
- KIMI output is treated as collaborator work product, not hostile input.
- Controller-owned side effects remain explicit so runs are traceable, resumable, and reviewable.

The controller separates collaboration trust from durable side-effect authority:

- Read access: allowed by default within the configured workspace.
- Research execution: allowed by default.
- Draft artifact creation: allowed by default.
- External publishing: requires approval.
- Final Linear commit: requires approval.
- Repository writes outside designated output paths: allowed only when the current run explicitly includes implementation work or the operator approves it.
- Credential exposure or secret handling: not copied into prompts, transcripts, or artifacts unless explicitly approved by the operator.

### KIMI External Compute Lane

KIMI is an active planning, research, coding, review, and debugging resource. It is not the orchestrator and it is not the source of truth.

Authority boundary:

- KIMI may draft, sharpen, critique, or challenge planning documents.
- KIMI may run large-context research and codebase review.
- KIMI may propose implementation plans, patch strategies, and test/debugging hypotheses.
- KIMI may provide independent second opinions for high-risk work.
- KIMI must not replace the two-planner PM debate, Synthesizer, CSO gate, QA gate, Linear records, Paperclip run records, or operator approval.
- If KIMI conflicts with PM debate, CSO/QA review, Linear records, evidence, or user instruction, the conflict must be surfaced to the Operator.

Preferred integration order:

1. KIMI CLI lane for planning documents, critique, bounded experiments, implementation proposals, debugging, and independent review.
2. KIMI API lane for read-only long-context analysis when CLI execution is unnecessary.
3. KIMI Agent SDK lane only when Paperclip or a custom router needs programmatic session orchestration.

Default use:

- Level 1 work: KIMI is optional.
- Level 2 work: KIMI should be considered by default for PRDs, Decision Packets, architecture notes, scope tradeoffs, and large-context questions.
- Level 3 work: KIMI should be used by default for independent review, release-readiness challenge, rollback critique, or validation evidence analysis.

### Mirage

Role: common resource surface.

Mirage mounts Linear, Paperclip-linked outputs, repo files, and research artifacts into a shared tree so agents can use a consistent file-like interface.

Recommended mount policy:

```text
/linear       read/write final records only
/paperclip    read run metadata, write run summaries through Paperclip adapter
/repo         read-only by default
/research     read/write research packets and source notes
/output       read/write generated artifacts
/scratch      read/write temporary agent work
```

Mirage is not the security boundary. If untrusted execution enters the design later, add a real sandbox layer.

### Superpowers

Role: primary workflow skeleton.

Superpowers owns the high-level progression:

```text
brainstorm -> plan -> review -> work -> verify -> complete
```

In this harness, Superpowers maps to:

- Brainstorm: PM debate
- Plan: synthesis into Research Brief and PRD
- Review: CSO and QA gates
- Work: Linear issue set creation and artifact packaging
- Verify: consistency checks and gate status
- Complete: Linear commit and Paperclip archive

### Compound Engineering

Role: compounding loop after reviewed work.

Compound Engineering runs after CSO/QA review and before final archive. It extracts reusable assets:

- PM debate prompt templates
- CSO review rubric improvements
- QA checklist improvements
- Linear issue templates
- Decision log patterns
- Failure handling notes
- Harness runbook updates

### GStack

Role: forced specialist review.

Required GStack-style gates:

- CSO: Chief Strategy Officer review
- QA: quality and verification review

Optional GStack-style gates:

- CEO review
- Engineering manager review
- Design review
- DevEx review
- Office hours

## Agent Roster

### Market/Opportunity PM

Mandate:

- Identify target users and underserved jobs.
- Frame market wedge and opportunity.
- Compare alternatives.
- Push for stronger positioning and scope ambition.

Output:

- Opportunity thesis
- User/problem framing
- Market and competitor assumptions
- Suggested product bets
- Risks from under-ambition

### Execution/Risk PM

Mandate:

- Challenge scope, sequencing, dependencies, and feasibility.
- Identify operational and delivery risks.
- Convert vague ideas into testable requirements.
- Push for smaller validated increments.

Output:

- Execution critique
- Risk register
- Dependency map
- Scope reduction proposals
- Verification strategy

### Synthesizer

Mandate:

- Merge conflicting PM outputs into one coherent planning artifact.
- Preserve meaningful disagreements as open questions.
- Avoid averaging away strong opinions.
- Produce final candidate Research Brief and PRD.

Output:

- Research Brief draft
- PRD draft
- Open questions
- Decision candidates
- Proposed Linear issue set

### CSO

Mandate:

- Evaluate strategic fit and focus.
- Challenge whether the problem is worth solving now.
- Check sequencing and defensibility.
- Reject plans that are coherent but strategically weak.

Output:

- `pass`, `revise`, or `blocked`
- Strategy critique
- Required changes
- Strategic decision log entries

### QA

Mandate:

- Verify artifact quality, acceptance criteria, and issue completeness.
- Check that claims are grounded or marked as assumptions.
- Confirm every Linear issue is actionable and testable.
- Reject outputs that cannot be validated.

Output:

- `pass`, `revise`, or `blocked`
- QA findings
- Missing acceptance criteria
- Inconsistency list
- Required corrections

### Operator/Harness Controller

Mandate:

- Start and stop Paperclip runs.
- Enforce state transitions.
- Route artifacts between agents.
- Approve final Linear commits.
- Archive run summaries.

Output:

- Run manifest
- State transition log
- Final publish packet
- Archive packet

## State Machine

```text
INTAKE
  -> PM_DEBATE
  -> SYNTHESIS
  -> CSO_REVIEW
  -> QA_REVIEW
  -> PLAN_REVIEW
  -> COMPOUND_EXTRACTION
  -> LINEAR_COMMIT
  -> PAPERCLIP_ARCHIVE
  -> DONE
```

Allowed terminal states:

```text
DONE
BLOCKED
ARCHIVED_WITHOUT_COMMIT
```

Every non-terminal step returns:

```yaml
status: pass | revise | blocked
summary: string
required_changes: string[]
artifacts:
  - name: string
    path_or_url: string
```

Revision loop:

```text
revise from CSO_REVIEW -> SYNTHESIS
revise from QA_REVIEW -> SYNTHESIS
revise from PLAN_REVIEW -> PM_DEBATE or SYNTHESIS, chosen by operator
blocked from any state -> BLOCKED
```

## Project Intake Gate

Harness setup must not ask for full project details prematurely. Ask for the smallest input required to start the first real run.

Minimal intake questions:

1. What outcome should this project produce?
2. Who is the target user or operator?
3. What would make this project successful?

Ask for additional details only when they are required:

- hard constraints
- deadline
- repository or runtime context
- security/privacy requirements
- integrations
- non-goals
- preferred stack
- deployment target
- acceptance tests

If optional context is missing, proceed with safe defaults and record assumptions in Linear.

## Friction Budget and Task Profiles

Use the lightest workflow that still protects the task. Escalate only when risk, ambiguity, user impact, operational blast radius, or irreversibility increases.

Default levels:

| Level | Name | Use When | Required Evidence |
| --- | --- | --- | --- |
| 1 | Daily Driver | Trivial, normal, mechanical, or low-risk work | Summary and validation status |
| 2 | Product Decision | Research or planning that drives roadmap, scope, UX, priority, pricing, positioning, architecture, or business judgment | Decision, options, rationale, selected path, assumptions, and Linear decision record |
| 3 | High-Risk / Release | Auth, authorization, secrets, payments, migrations, privacy, production, deployment, irreversible operations, or broad user impact | Approval, CSO/QA verdicts, rollback plan, validation evidence, residual risk, and Linear risk/approval record |

Profile mapping:

```yaml
trivial: Level 1
normal: Level 1
ui: Level 1 unless user impact, accessibility risk, release risk, or product judgment escalates it
runtime: Level 1 unless production, deployment, external integration, or destructive operation risk escalates it
research: Level 2 if it drives a decision; otherwise lightweight research
high-risk: Level 3
```

Escalation rules:

- If Level 1 work reveals product ambiguity, escalate to Level 2.
- If work touches sensitive data, credentials, money, production, deployment, destructive operations, or irreversible changes, escalate to Level 3.
- If only optional context is missing, do not escalate. Use a safe default and record the assumption.
- If escalation adds friction without improving safety or decision quality, keep the lower level.

## Task Profile Routing

Each run must record:

```yaml
task_profile: trivial | normal | ui | runtime | research | high-risk
friction_level: 1 | 2 | 3
kimi_cli_decision: use | skip
kimi_cli_reason: string
required_reviews:
  - cso
  - qa
required_evidence:
  - string
```

Routing rules:

- Level 1 may skip PM debate if no product decision is involved.
- Level 2 research must use PM debate, Synthesizer, Decision Log, and Linear decision record.
- Level 2 should explicitly decide whether to use KIMI CLI before final approval.
- Level 3 must use CSO, QA, explicit operator approval or risk acceptance, rollback/recovery plan, and independent review when available.
- GStack CEO, engineering lead, or office-hours review may be added when strategy, architecture, or cross-functional ambiguity is material.

## Evidence Gate Policy

Every run must state what evidence is required before completion.

Evidence by level:

- Level 1: summary, changed artifacts, and validation status.
- Level 2: Research Brief, PRD or Decision Packet, options considered, rationale, assumptions, selected path, PM debate summary, CSO/QA status when required, and Linear decision record.
- Level 3: all Level 2 evidence plus CSO verdict, QA verdict, rollback/recovery plan, approval or accepted risk, residual risk, and follow-up tasks.

Evidence rules:

- Evidence belongs in publish packets and final summaries, not raw transcripts.
- Missing evidence must be recorded as a blocker or explicit residual risk.
- Unsupported claims must be labeled as assumptions.
- Linear should receive the decision and evidence summary, not the full agent transcript.

## Human Decision Protocol

Human decisions are required when:

- External publishing is requested.
- Final Linear commit is requested.
- KIMI, PM debate, CSO, QA, Linear records, or user instruction materially conflict.
- The run exceeds its revision loop budget.
- Level 3 work requires risk acceptance.
- Credentials, secrets, destructive operations, production deployment, or irreversible actions are involved.

Decision packet shape:

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

Record approved or rejected decisions in Linear. Record waiting state and resume condition in Paperclip.

## Artifact Contracts

### Research Brief

Required sections:

- Research question
- Context
- Key findings
- Evidence
- Assumptions
- Uncertainties
- Alternatives considered
- Recommended direction
- Next research questions

Quality bar:

- Separate fact from interpretation.
- Mark unsupported claims as assumptions.
- Include enough context for a new agent to continue.

### PRD

Required sections:

- Problem
- Target user
- Goal
- Non-goals
- User stories or jobs
- Requirements
- Acceptance criteria
- Dependencies
- Risks
- Metrics or success signals
- Open questions

Quality bar:

- Each requirement must map to at least one acceptance criterion.
- Each open question must have an owner or next action.
- Non-goals must actively constrain scope.

### Linear Issue Set

Each issue must include:

```yaml
title: string
type: research | product | engineering | qa | decision
source_artifact: Research Brief | PRD | Decision Log
summary: string
context: string
acceptance_criteria:
  - string
dependencies:
  - linear_issue_id_or_title
labels:
  - string
status: backlog | ready | blocked
```

Issue quality bar:

- One issue should have one clear outcome.
- Acceptance criteria must be observable.
- Dependencies must be explicit.
- Research issues must state the decision they unblock.

### Agent Run Transcript

Stored in Paperclip, not Linear.

Required fields:

```yaml
run_id: string
linear_project_id: string
linear_issue_ids:
  - string
agent_name: string
agent_role: string
input_artifacts:
  - string
output_artifacts:
  - string
started_at: string
ended_at: string
status: pass | revise | blocked | failed
cost_estimate: string
summary: string
full_transcript_ref: string
```

### Decision Log

Stored in Linear.

Required fields:

```yaml
decision_id: string
date: string
decision: string
status: proposed | approved | rejected | superseded
context: string
options_considered:
  - string
rationale: string
dissenting_view: string
owner: string
linked_artifacts:
  - string
```

Quality bar:

- Record the rejected alternative.
- Record the strongest dissenting view.
- Link to the artifact that caused the decision.

## Gate Rubrics

### CSO Gate

Pass only if:

- The plan has a clear strategic objective.
- The selected wedge is explicit.
- The plan says why now.
- The plan has a credible sequencing argument.
- The scope is focused enough to execute.
- The strongest alternative has been considered.

Return `revise` if:

- The plan is useful but unfocused.
- The strategy is implied but not stated.
- The opportunity is plausible but weakly supported.

Return `blocked` if:

- The plan has no strategic objective.
- The work is mostly activity without a decision.
- The proposed direction conflicts with known constraints.

### QA Gate

Pass only if:

- Every PRD requirement has acceptance criteria.
- Every Linear issue is actionable.
- Every claim is either evidenced or marked as assumption.
- Open questions are explicit.
- The Research Brief, PRD, issue set, and Decision Log agree.

Return `revise` if:

- Criteria are incomplete but fixable.
- Some claims need assumption labels.
- Issue decomposition is too coarse.

Return `blocked` if:

- The outputs contradict each other.
- The issue set cannot be executed.
- Critical dependencies are missing.

## Prompt Contracts

### Shared Role Header

```markdown
Role:
You are an agent inside a research-first PM harness. Your job is to produce decision-grade planning work, not generic advice.

# Goal
Advance the current harness state with a concrete artifact that can be reviewed, revised, or committed.

# Constraints
- Keep Linear clean: final decisions and results only.
- Keep Paperclip complete: run history and transcript references belong there.
- Mark unsupported claims as assumptions.
- Return `pass`, `revise`, or `blocked` when acting as a gate.

# Output
Use concise Markdown with explicit artifact sections. Include open questions and required changes when relevant.
```

### Market/Opportunity PM Prompt Addendum

```markdown
You are the Market/Opportunity PM. Bias toward finding a sharper user problem, stronger wedge, and more ambitious opportunity. Challenge timid scope, but do not ignore feasibility constraints.
```

### Execution/Risk PM Prompt Addendum

```markdown
You are the Execution/Risk PM. Bias toward feasibility, sequencing, operational risk, and validation. Challenge vague ambition, but do not reduce scope without explaining what decision the reduction improves.
```

### Synthesizer Prompt Addendum

```markdown
You are the Synthesizer. Merge the two PM positions into one coherent artifact. Do not average disagreements away. Preserve unresolved conflicts as open questions with recommended next actions.
```

### CSO Prompt Addendum

```markdown
You are the Chief Strategy Officer. Review whether this plan deserves focus now. Evaluate strategic objective, wedge, sequencing, differentiation, and opportunity cost. Return pass, revise, or blocked.
```

### QA Prompt Addendum

```markdown
You are QA. Verify artifact consistency, issue actionability, acceptance criteria, evidence labels, and open questions. Return pass, revise, or blocked.
```

## Adapter Contracts

The controller must call tools through adapters instead of embedding tool-specific behavior in state logic.

Each adapter must expose:

```yaml
name: string
version: string
inputs: object
outputs: object
side_effects:
  - string
idempotency_key: string
timeout_seconds: integer
retry_policy:
  max_attempts: integer
  backoff_seconds: integer
failure_modes:
  - string
```

Required adapters:

- Linear adapter
- Paperclip adapter
- Mirage workspace adapter
- KIMI CLI runner
- GStack review runner
- Compound extraction runner

### Linear Adapter

Responsibilities:

- Create or update Linear project records.
- Create or update Research Brief and PRD documents.
- Create or update Linear issues.
- Create or update Decision Log entries.
- Return stable Linear IDs for all committed records.

Inputs:

```yaml
harness_run_id: string
publish_packet_path: string
idempotency_key: string
approval_status: approved
```

Outputs:

```yaml
linear_project_id: string
linear_document_ids:
  research_brief: string
  prd: string
linear_issue_ids:
  - string
decision_log_ids:
  - string
commit_summary_path: string
```

Failure modes:

- authentication_failed
- permission_denied
- duplicate_record_conflict
- partial_commit
- network_timeout
- validation_failed

### Paperclip Adapter

Responsibilities:

- Create a run.
- Record state transitions.
- Record agent starts and completions.
- Store transcript references.
- Archive final run summaries.

Inputs:

```yaml
harness_run_id: string
linear_project_id: string
run_manifest_path: string
idempotency_key: string
```

Outputs:

```yaml
paperclip_run_id: string
paperclip_run_url: string
archive_packet_path: string
```

Failure modes:

- authentication_failed
- run_not_found
- transcript_write_failed
- archive_failed
- network_timeout

### Mirage Workspace Adapter

Responsibilities:

- Resolve mounted resource paths.
- Validate read/write policy.
- Produce normalized file paths for agents.

Inputs:

```yaml
harness_run_id: string
mount_request:
  path: string
  mode: read | write | read_write
```

Outputs:

```yaml
resolved_path: string
access_granted: boolean
policy_reason: string
```

Failure modes:

- mount_not_found
- access_denied
- path_escape_attempt
- stale_mount

### KIMI CLI Runner

Responsibilities:

- Run KIMI with a specified prompt and input packet.
- Write outputs to the run directory.
- Return a structured completion packet.

Inputs:

```yaml
harness_run_id: string
agent_name: string
prompt_template_path: string
input_packet_path: string
output_dir: string
timeout_seconds: integer
```

Outputs:

```yaml
status: pass | revise | blocked | failed
summary: string
output_artifact_paths:
  - string
transcript_ref: string
```

Failure modes:

- cli_not_found
- model_auth_failed
- timeout
- malformed_output
- output_missing
- command_failed

### GStack Review Runner

Responsibilities:

- Invoke CSO and QA review roles.
- Enforce review output status.
- Store review artifacts.

Inputs:

```yaml
harness_run_id: string
review_role: cso | qa | ceo | engineering_manager | office_hours
artifact_packet_path: string
prompt_template_path: string
```

Outputs:

```yaml
status: pass | revise | blocked | failed
review_path: string
required_changes:
  - string
```

Failure modes:

- review_role_unavailable
- malformed_review
- timeout
- command_failed

### Compound Extraction Runner

Responsibilities:

- Read completed run artifacts.
- Extract reusable patterns.
- Propose harness improvements.
- Keep proposed changes separate from committed Linear artifacts.

Inputs:

```yaml
harness_run_id: string
final_artifacts_dir: string
review_findings_dir: string
run_metrics_path: string
```

Outputs:

```yaml
extracted_patterns_path: string
proposed_harness_updates_path: string
anti_patterns_path: string
```

Failure modes:

- missing_run_data
- malformed_metrics
- extraction_failed
- timeout

## Idempotency

All external side effects must be idempotent.

Idempotency key format:

```text
<harness-run-id>:<state-name>:<artifact-kind>:<stable-slug>
```

Required idempotency keys:

- Paperclip run creation
- Paperclip state event write
- Paperclip archive write
- Linear project update
- Linear document update
- Linear issue creation or update
- Decision Log entry creation or update
- Artifact archive creation

Rules:

- Re-running a state must update the existing external record when possible.
- A failed Linear commit must be resumable from the last confirmed write.
- Every external write must log its idempotency key.
- The controller must check for an existing record before creating a new one.
- Duplicate Linear records are treated as `duplicate_record_conflict`, not success.
- Idempotency keys are part of the run archive.

## Observability

Paperclip should act as the operational timeline for the harness.

Required event types:

```yaml
event_type:
  - run_created
  - state_started
  - state_completed
  - state_revised
  - state_blocked
  - agent_started
  - agent_completed
  - adapter_call_started
  - adapter_call_completed
  - adapter_call_failed
  - human_approval_requested
  - human_approval_granted
  - human_approval_denied
  - waiting_for_human
  - waiting_for_review
  - waiting_for_ci
  - waiting_for_access
  - waiting_for_decision
  - linear_commit_started
  - linear_commit_completed
  - linear_commit_failed
  - archive_completed
```

Required event fields:

```yaml
event_id: string
harness_run_id: string
paperclip_run_id: string
state: string
event_type: string
timestamp: string
actor: string
idempotency_key: string
summary: string
artifact_refs:
  - string
```

Required metrics:

- Run duration
- State duration
- Agent duration
- Adapter duration
- Retry count
- Revision count
- Blocked count
- Timeout count
- Estimated model cost
- Final artifact count
- Linear records committed

Observability rules:

- Every state transition must emit an event.
- Every adapter call must emit start and completion or failure events.
- Every human approval request must emit a request and outcome event.
- Every waiting state must point to a Linear issue or decision record.
- Compound Extraction must consume metrics and review findings.

## Timeouts and Loop Budgets

Default timeout values:

```yaml
agent_timeout_seconds: 1800
adapter_timeout_seconds: 120
review_timeout_seconds: 900
compound_timeout_seconds: 900
max_revision_loops: 2
max_agent_retry_attempts: 1
max_adapter_retry_attempts: 2
```

Rules:

- Timeout is a failure mode.
- Timeout must never be silently converted to `blocked`.
- Adapter retries must use the same idempotency key.
- If a state exceeds `max_revision_loops`, route to Operator.
- If an agent fails after retry, route to Operator.
- If Linear commit times out, check for partial commit before retrying.

## Authority Matrix

KIMI is trusted and has full workspace access as a collaborator. The controller owns durable side effects for traceability, not because KIMI is treated as hostile.

| Action | KIMI | Agents | Controller | Operator |
| --- | --- | --- | --- | --- |
| Read workspace | Allowed | Scoped | Allowed | Allowed |
| Write scratch/output | Allowed | Allowed | Allowed | Allowed |
| Modify repo source | Approval required | No | Approval required | Allowed |
| Create Paperclip run | No | No | Allowed | Allowed |
| Record Paperclip events | No | No | Allowed | Allowed |
| Commit to Linear | No | No | Approval required | Allowed |
| Publish externally | No | No | Approval required | Allowed |
| Access credentials | Operator-approved | Blocked | Approval required | Allowed |
| Change harness templates | Proposed patch only | Proposed patch only | Approval required | Allowed |

Rules:

- Agent output is trusted collaborator work product until accepted by the controller.
- Linear writes require operator approval.
- External publishing requires operator approval.
- Credentials must not be copied into transcripts, prompts, or artifacts unless explicitly approved.
- Repository source writes are outside V0 unless explicitly approved.

## Local Run Directory Layout

Each run must have a stable local directory.

```text
output/harness-runs/<run-id>/
  manifest.yaml
  intake.md
  events.jsonl
  metrics.yaml
  pm-debate/
    market-opportunity.md
    execution-risk.md
    debate-summary.md
  synthesis/
    research-brief.md
    prd.md
    linear-issue-set.yaml
    decision-log.yaml
  reviews/
    cso-review.md
    qa-review.md
    plan-review.md
  compound/
    extracted-patterns.md
    proposed-harness-updates.md
    anti-patterns.md
  publish/
    linear-publish-packet.yaml
    paperclip-archive-packet.yaml
  archive/
    paperclip-summary.yaml
    linear-commit-summary.yaml
```

Rules:

- Agents write only inside the current run directory unless explicitly approved.
- Final Linear commit uses files from `publish/`.
- Paperclip archive uses files from `archive/` and transcript references.
- `events.jsonl` is append-only.
- `metrics.yaml` is updated by the controller.

## Fixture Plan

Before real integrations, the harness needs file-based fixtures.

Required fixtures:

```text
tests/fixtures/harness/
  intake/basic-research-request.md
  pm-debate/market-opportunity.md
  pm-debate/execution-risk.md
  synthesis/research-brief.md
  synthesis/prd.md
  synthesis/linear-issue-set.yaml
  synthesis/decision-log.yaml
  reviews/cso-pass.md
  reviews/cso-revise.md
  reviews/qa-pass.md
  reviews/qa-blocked.md
  publish/linear-success.yaml
  publish/linear-partial-commit.yaml
```

Fixture scenarios:

- Normal pass path to `DONE`
- CSO `revise` path back to `SYNTHESIS`
- QA `blocked` path to `BLOCKED`
- Linear partial commit recovery
- Paperclip archive after failed Linear commit

## Versioned Prompt Templates

Prompt contracts must be extracted into versioned templates before automation.

Recommended files:

```text
docs/harness/templates/prompts/shared-role.md
docs/harness/templates/prompts/market-opportunity-pm.md
docs/harness/templates/prompts/execution-risk-pm.md
docs/harness/templates/prompts/synthesizer.md
docs/harness/templates/prompts/cso.md
docs/harness/templates/prompts/qa.md
```

Each template must include:

```yaml
template_id: string
version: string
role: string
inputs:
  - string
outputs:
  - string
stop_rules:
  - string
failure_behavior:
  - string
```

Rules:

- Template changes must be versioned.
- Paperclip run metadata must record template versions.
- Linear artifacts should not include full prompt text.
- Compound Extraction may propose template changes but must not apply them automatically.

## Linear Object Model

Recommended V0 hierarchy:

```text
Linear Project: Research initiative
  Document: Research Brief
  Document: PRD
  Issue group: Execution issues
  Issue group: Research follow-ups
  Issue group: Decisions
```

Required metadata for each Linear record:

```yaml
harness_run_id: string
paperclip_run_url: string
artifact_version: string
source_state: string
approval_status: proposed | approved | rejected | superseded
idempotency_key: string
```

Rules:

- Research Brief and PRD are documents, not issues.
- Execution work is represented as issues.
- Decision Log entries may be Linear issues or document sections, but the choice must be consistent within a project.
- Every issue must link back to the PRD or Research Brief section that created it.
- Every decision must include at least one rejected alternative.

## Compound Extraction Contract

Compound Engineering consumes a completed or blocked run and proposes harness improvements.

Inputs:

- Final artifacts
- CSO findings
- QA findings
- Revision count
- Blocked reasons
- Operator overrides
- Adapter failures
- Prompt template versions
- Run metrics

Outputs:

```yaml
reusable_prompt_improvements:
  - string
rubric_updates:
  - string
runbook_updates:
  - string
template_updates:
  - string
anti_patterns_observed:
  - string
operator_decisions_to_reuse:
  - string
```

Rules:

- Compound Extraction never mutates Linear deliverables.
- Compound Extraction never silently changes prompt templates.
- Proposed harness updates require operator approval.
- Anti-patterns should be specific enough to prevent repeat failures.

## Completion Contract

Before a run is marked complete, check the active task profile and confirm all required evidence is present.

For Level 1 work, completion requires:

- task profile recorded
- implementation or research summary
- validation status
- residual risks or follow-ups if any

For Level 2 work, completion requires:

- Linear issue/status or decision record updated
- task profile recorded
- Research Brief, PRD, or Decision Packet summary
- options and rationale
- assumptions
- validation evidence
- required review verdicts
- residual risks and follow-up tasks

For Level 3 work, completion also requires:

- CSO review
- QA review
- explicit approval or risk acceptance
- rollback or recovery plan
- independent review when available

If any required completion item is missing, do not claim completion. Report the blocker and next action instead.

## Runbook

### 1. Intake

Inputs:

- User request
- Existing Linear project or issue
- Existing research context
- Constraints and non-goals

Outputs:

- Paperclip run created
- Linear project or issue linked
- Initial run manifest

### 2. PM Debate

Steps:

1. Send same intake packet to Market/Opportunity PM.
2. Send same intake packet to Execution/Risk PM.
3. Require each PM to critique the other's strongest likely position.
4. Store both outputs in Paperclip transcript storage.

Outputs:

- Market/Opportunity memo
- Execution/Risk memo
- Debate summary

### 3. Synthesis

Steps:

1. Synthesizer reads both PM memos.
2. Synthesizer drafts Research Brief.
3. Synthesizer drafts PRD.
4. Synthesizer drafts Linear issue set.
5. Synthesizer drafts Decision Log entries.

Outputs:

- Candidate Research Brief
- Candidate PRD
- Candidate Linear issue set
- Candidate Decision Log

### 4. CSO Review

Steps:

1. CSO reviews synthesized artifacts.
2. CSO returns `pass`, `revise`, or `blocked`.
3. If `revise`, route required changes back to Synthesizer.
4. If `blocked`, stop and preserve blocked reason in Paperclip.

Outputs:

- CSO gate report
- Strategy decision updates

### 5. QA Review

Steps:

1. QA checks consistency across all candidate artifacts.
2. QA validates issue actionability and acceptance criteria.
3. QA returns `pass`, `revise`, or `blocked`.
4. If `revise`, route required changes back to Synthesizer.

Outputs:

- QA gate report
- Corrected artifact requirements

### 6. Plan Review

Steps:

1. Operator checks whether Superpowers plan/review expectations are satisfied.
2. Operator decides whether to request another PM debate loop or proceed.
3. Approved plan moves to compounding.

Outputs:

- Plan review status
- Approval or revision note

### 7. Compound Extraction

Steps:

1. Extract reusable improvements from the run.
2. Update prompt/rubric/runbook candidates.
3. Keep proposed harness improvements separate from current Linear project deliverables.

Outputs:

- Compounding notes
- Proposed harness updates

### 8. Linear Commit

Steps:

1. Operator approves final publish packet.
2. Commit Research Brief, PRD, issue set, and Decision Log to Linear.
3. Link Linear records to Paperclip run ID.

Outputs:

- Linear project update
- Linear issue set
- Decision log entries

### 9. Paperclip Archive

Steps:

1. Archive full agent run transcript.
2. Store artifact references.
3. Store final state and cost estimate.
4. Link to Linear records.

Outputs:

- Paperclip archive packet
- Final run summary

## Failure Handling

### Agent Failure

If an agent fails:

- Mark its run as `failed` in Paperclip.
- Retry once with the same input packet.
- If retry fails, route to Operator.
- Do not commit partial output to Linear.

### Artifact Conflict

If artifacts conflict:

- QA returns `blocked` if conflict affects execution.
- Synthesizer must produce a conflict table.
- Operator decides whether to restart PM debate or narrow scope.

### Strategic Block

If CSO blocks:

- Preserve blocked reason in Paperclip.
- Add a Linear decision log entry only if the operator approves.
- Do not create execution issues unless the block is resolved.

### Linear Commit Failure

If Linear commit fails:

- Keep final artifacts in `/output`.
- Mark Paperclip archive as `commit_failed`.
- Retry only after confirming no duplicate Linear records were created.

## Minimum Viable Harness

V0 requires:

- One Paperclip company/team configuration
- Five agents: Market PM, Risk PM, Synthesizer, CSO, QA
- One Linear project template
- One Decision Log template
- One Research Brief template
- One PRD template
- One issue set schema
- One run manifest schema
- One operator approval step before Linear commit

V0 does not require:

- Automatic Paperclip to Linear sync
- Multi-project portfolio dashboards
- Full sandbox isolation
- Autonomous external publishing
- Long-term memory beyond Paperclip archive and Linear records

## Open Questions

- Should KIMI write directly to `/output`, or should all KIMI outputs pass through a controller-normalized packet first?
- Should CSO review happen before or after first PRD draft? Current default: after first synthesis.
- Should QA be allowed to edit artifacts directly, or only return findings? Current default: findings only.
- Should Compound Engineering update harness files automatically, or produce proposed patches for operator approval? Current default: proposed patches only.
- What Linear hierarchy should be used: project documents plus issues, or one tracking issue plus linked documents?

## Acceptance Criteria

- The harness has distinct roles for Linear, Paperclip, KIMI, Mirage, Superpowers, Compound Engineering, and GStack.
- PM debate uses at least two PM agents with different biases.
- Synthesizer is separate from both PM agents.
- CSO means Chief Strategy Officer and is a mandatory gate.
- QA is a mandatory gate.
- Research Brief, PRD, Linear issue set, Agent run transcript, and Decision Log are separate artifacts.
- Linear stores results and decisions only.
- Paperclip stores agent run history.
- Every state transition has a clear next state.
- Every gate returns `pass`, `revise`, or `blocked`.
