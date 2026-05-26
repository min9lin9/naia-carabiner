# Research Lead Agent Design

Status: approved design draft
Date: 2026-05-20
Harness: `docs/harness/kimi-pm-linear-paperclip-harness-spec.md`

## Goal

Create a Research Lead agent for the KIMI PM research harness. The Research Lead coordinates research planning, agent routing, state transitions, and publish readiness without becoming the evidence researcher, PM, CSO, QA, or final decision-maker.

## KIMI Trust Model

The Research Lead should assume KIMI CLI is a trusted full-access collaborator. KIMI can be delegated real research and planning work with full workspace context.

This trust does not remove the controller's job. Durable side effects still flow through explicit controller/operator gates so the run is traceable, resumable, and reviewable.

Implications:

- Do not design around adversarial KIMI behavior.
- Do not treat KIMI output as hostile input.
- Do not over-redact context from KIMI by default.
- Prefer clear task packets over defensive isolation.
- Let KIMI read and produce run artifacts freely inside the run workspace.
- Keep Linear commit, Paperclip archive, and external publish authority explicit.

## Design Choice

Use a Coordinator-only Research Lead.

Rejected alternatives:

- Coordinator plus Evidence Scout: faster initial research, but it blurs the boundary between orchestration and evidence gathering.
- Autonomous Research Owner: powerful, but too broad for V0 and more likely to create uncontrolled side effects.

The Coordinator-only design preserves the harness principle: debate and review happen through specialized agents, while durable side effects are controlled by the controller and operator.

## Responsibilities

The Research Lead owns:

- Intake normalization
- Task profile classification
- Friction level recommendation
- Research question framing
- Decision-needed framing
- Constraint and non-goal capture
- Success criteria capture
- Agent routing
- State transition recommendations
- Artifact completeness checks
- Evidence gate checks
- Human decision packet preparation
- Publish readiness reporting

The Research Lead does not own:

- Final business decisions
- Direct Linear commits
- Paperclip archive writes
- Full evidence research
- PM debate content
- CSO strategy judgment
- QA validation judgment
- Repository source modification

## Inputs

Required inputs:

```yaml
harness_run_id: string
user_request: string
operator_constraints:
  - string
available_context:
  - path_or_url: string
    description: string
linear_project_id: string
paperclip_run_id: string
```

Optional inputs:

```yaml
prior_research:
  - path_or_url: string
known_decisions:
  - string
known_open_questions:
  - string
deadline: string
```

## Outputs

The Research Lead writes these artifacts inside the current run directory:

```text
output/harness-runs/<run-id>/
  intake.md
  research-lead-plan.yaml
  agent-routing.yaml
  state-transition-log.jsonl
  publish-readiness-report.md
```

### `intake.md`

Purpose: normalized research request.

Required sections:

- Original request
- Research question
- Decision needed
- Context
- Constraints
- Non-goals
- Success criteria
- Known assumptions
- Open questions

### `research-lead-plan.yaml`

Purpose: executable coordination plan.

Required shape:

```yaml
harness_run_id: string
research_question: string
decision_needed: string
success_criteria:
  - string
task_profile: trivial | normal | ui | runtime | research | high-risk
friction_level: 1 | 2 | 3
kimi_cli_decision: use | skip
kimi_cli_reason: string
required_evidence:
  - string
required_agents:
  - market_opportunity_pm
  - execution_risk_pm
  - synthesizer
  - cso
  - qa
planned_states:
  - INTAKE
  - PM_DEBATE
  - SYNTHESIS
  - CSO_REVIEW
  - QA_REVIEW
  - PLAN_REVIEW
  - COMPOUND_EXTRACTION
  - LINEAR_COMMIT
  - PAPERCLIP_ARCHIVE
operator_approval_required:
  - LINEAR_COMMIT
  - external_publish
```

### `agent-routing.yaml`

Purpose: routing packet for each downstream agent.

Required shape:

```yaml
harness_run_id: string
routes:
  - state: PM_DEBATE
    agent: market_opportunity_pm
    input_packet: string
    expected_output: market_opportunity_memo
  - state: PM_DEBATE
    agent: execution_risk_pm
    input_packet: string
    expected_output: execution_risk_memo
  - state: SYNTHESIS
    agent: synthesizer
    input_packet: string
    expected_output: synthesis_packet
  - state: CSO_REVIEW
    agent: cso
    input_packet: string
    expected_output: cso_gate_report
  - state: QA_REVIEW
    agent: qa
    input_packet: string
    expected_output: qa_gate_report
```

### `state-transition-log.jsonl`

Purpose: append-only coordination log.

Each line:

```json
{"harness_run_id":"run-001","state":"PM_DEBATE","status":"pass","actor":"research_lead","summary":"Both PM routes are ready.","next_state":"SYNTHESIS"}
```

### `publish-readiness-report.md`

Purpose: final pre-commit check for the operator.

Required sections:

- Task profile and friction level
- Research Brief status
- PRD status
- Linear issue set status
- Decision Log status
- Evidence gate status
- CSO gate status
- QA gate status
- KIMI CLI usage decision and result
- Open blocking items
- Operator approval checklist
- Recommendation: commit, revise, or block

## Project Intake Gate and Friction Budget

The Research Lead should not ask for full project detail during harness setup. For the first real run, ask only for the smallest missing input:

1. What outcome should this project produce?
2. Who is the target user or operator?
3. What would make this project successful?

Use optional context only when needed:

- hard constraints
- deadline
- repository or runtime context
- security/privacy requirements
- integrations
- non-goals
- preferred stack
- deployment target
- acceptance tests

Classify each run:

```yaml
Level 1: Daily Driver
Level 2: Product Decision
Level 3: High-Risk / Release
```

Research that drives a decision is Level 2 by default. Level 3 applies when the run touches credentials, privacy, production, deployment, irreversible operations, broad user impact, or explicit risk acceptance.

## KIMI External Compute Lane

The Research Lead should trust KIMI CLI as a full-access collaborator and explicitly decide whether to use it.

Default:

- Level 1: KIMI optional.
- Level 2: consider KIMI by default for PRDs, Decision Packets, architecture notes, scope tradeoffs, and large-context questions.
- Level 3: use KIMI by default for independent review, release-readiness challenge, rollback critique, or validation evidence analysis.

KIMI must not replace:

- two-planner PM debate
- Synthesizer
- CSO review
- QA review
- Linear decision record
- Paperclip run record
- operator approval

If KIMI conflicts with PM debate, CSO/QA, Linear records, evidence, or user instruction, the Research Lead prepares a Human Decision Packet.

## Completion Contract

The Research Lead must not mark publish readiness as complete until the evidence required by the current friction level is present.

Level 1 requires summary, validation status, and residual risk or follow-up notes.

Level 2 requires Research Brief, PRD or Decision Packet summary, options considered, rationale, assumptions, validation evidence, review verdicts when required, residual risks, follow-up tasks, and a Linear decision record.

Level 3 additionally requires CSO review, QA review, explicit approval or risk acceptance, rollback or recovery plan, and independent review when available.

## Human Decision Packet

Create a Human Decision Packet when a material decision cannot be safely resolved by the harness.

Required shape:

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

## State Behavior

### INTAKE

The Research Lead converts the user request into `intake.md` and `research-lead-plan.yaml`.

Pass criteria:

- Research question is explicit.
- Decision needed is explicit.
- Success criteria are observable.
- Non-goals constrain the run.

Revise criteria:

- Request is understandable but too broad.
- Decision needed is implied but not explicit.

Blocked criteria:

- The Research Lead cannot infer a safe research objective.

### PM_DEBATE

The Research Lead prepares identical intake packets for Market/Opportunity PM and Execution/Risk PM.

Pass criteria:

- Both PM routes have the same base context.
- Each PM has a distinct mandate.
- Expected outputs are named.

### SYNTHESIS

The Research Lead routes PM outputs to the Synthesizer and checks output completeness.

Pass criteria:

- Research Brief draft exists.
- PRD draft exists.
- Linear issue set draft exists.
- Decision Log draft exists.
- Open questions are preserved.

### CSO_REVIEW

The Research Lead routes synthesized artifacts to CSO.

Pass criteria:

- CSO returns `pass`.

Revise criteria:

- CSO returns `revise`; Research Lead routes required changes back to Synthesizer.

Blocked criteria:

- CSO returns `blocked`.

### QA_REVIEW

The Research Lead routes synthesized artifacts and CSO findings to QA.

Pass criteria:

- QA returns `pass`.

Revise criteria:

- QA returns `revise`; Research Lead routes required changes back to Synthesizer.

Blocked criteria:

- QA returns `blocked`.

### PLAN_REVIEW

The Research Lead checks whether the run is ready for operator review.

Pass criteria:

- Required artifacts exist.
- Required gates passed.
- Revision loop budget is not exceeded.
- Open questions are either non-blocking or routed to the operator.

### COMPOUND_EXTRACTION

The Research Lead prepares the run packet for Compound Extraction.

Pass criteria:

- Final artifacts are available.
- CSO and QA findings are available.
- Metrics and revision counts are available.

### LINEAR_COMMIT

The Research Lead does not commit to Linear. It prepares `publish-readiness-report.md` and waits for operator/controller approval.

### PAPERCLIP_ARCHIVE

The Research Lead does not archive directly. It ensures transcript and artifact references are complete for the Paperclip adapter.

## Prompt Contract

The production prompt should live at:

`docs/harness/templates/prompts/research-lead.md`

Prompt requirements:

- Use outcome-first structure.
- Treat Linear as result and decision source of truth.
- Treat Paperclip as run history source.
- Do not commit to Linear.
- Do not publish externally.
- Return `pass`, `revise`, or `blocked` for each coordination checkpoint.
- Preserve unresolved disagreements as open questions.

## Error Handling

### Missing Context

If optional context is missing, proceed and mark the assumption.

If required context is missing, return `blocked`.

### Overbroad Request

If the request contains multiple independent research initiatives, return `revise` with a proposed decomposition.

### Conflicting Agent Outputs

If PM outputs conflict, route both to Synthesizer and require an explicit conflict table.

If CSO and QA conflict, route to Operator.

### Revision Loop Exhaustion

If revision loops exceed the harness budget, return `blocked` and route to Operator.

## Tests and Validation

Minimum validation scenarios:

- Basic request becomes a valid intake packet.
- Overbroad request returns `revise`.
- Missing required context returns `blocked`.
- Research request that drives a decision is classified as Level 2.
- High-risk request is classified as Level 3.
- Level 2 run records a KIMI CLI use/skip decision.
- PM routing includes both PM agents with identical base context.
- CSO `revise` routes back to Synthesizer.
- QA `blocked` stops the run.
- Publish readiness report refuses commit if CSO or QA is not `pass`.
- Publish readiness report refuses completion when required evidence is missing.

## Acceptance Criteria

- Research Lead is coordinator-only.
- Research Lead has explicit inputs and outputs.
- Research Lead writes only run artifacts.
- Research Lead does not commit to Linear.
- Research Lead does not archive to Paperclip directly.
- Research Lead routes Market/Opportunity PM and Execution/Risk PM separately.
- Research Lead preserves Synthesizer, CSO, and QA as distinct roles.
- Research Lead produces publish readiness rather than final approval.
- Research Lead records task profile, friction level, KIMI CLI decision, and evidence gate status.
- The design can be implemented with file-based stubs before real integrations.
