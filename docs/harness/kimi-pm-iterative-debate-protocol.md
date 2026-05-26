# KIMI PM Iterative Debate Protocol

Status: active canonical
Role: KIMI debate protocol
Scope: `/Users/burt/Documents/har-maker`

## Purpose

This protocol defines how KIMI participates in research-harness and harness-making runs.

KIMI has two separate roles:

1. One-time collaborator critique
2. PM-level iterative debate participant

The first role is broad independent critique. The second role is a bounded multi-round PM debate loop that continues until no participant has additional questions, or until the maximum round limit is reached.

## Core Rule

KIMI may challenge, question, and debate at PM level. KIMI does not become the official record, final decision maker, CSO, QA, Synthesizer, Linear writer, Paperclip writer, or operator approval.

## Phase 1: One-Time Collaborator Critique

Run this phase after intake and variant classification when `kimi_cli_decision: use`.

Purpose:

- identify missing references, weak assumptions, and unclear scope
- critique the normalized goal and proposed route
- identify likely PM debate tensions
- suggest evidence requirements
- point out where the research reference corpus should be used

Output:

```yaml
phase: kimi_collaborator_critique
status: pass | revise | blocked
summary: string
missing_references:
  - string
assumption_challenges:
  - string
pm_debate_questions:
  - string
recommended_evidence:
  - string
handoff_to_pm_debate: string
```

This phase happens once. If the critique changes the goal materially, Research Lead updates the intake and asks the operator if the change affects scope.

## Phase 2: PM-Level Iterative Debate

After the one-time collaborator critique, KIMI joins the PM debate as a PM-level participant.

Required participants:

- Market/Opportunity PM
- Execution/Risk PM
- KIMI PM
- Research Lead as moderator

Optional participants:

- Domain PM
- UX PM
- Data/Finance PM
- Operator-provided expert role

KIMI PM responsibilities:

- ask follow-up questions
- challenge weak product logic
- challenge weak evidence and source use
- compare against research reference corpus formats
- propose alternative product/research framings
- identify unresolved contradictions
- state when no additional questions remain

KIMI PM constraints:

- cannot make final operator decisions
- cannot override PM debate participants
- cannot replace Synthesizer, CSO, QA, Linear, Paperclip, or operator approval
- cannot continue the loop after the round cap

## Round Loop

The debate loop runs for up to 20 rounds.

Continue while:

- any participant has additional questions, or
- any participant marks a decision as unresolved, or
- Research Lead finds an unresolved contradiction that blocks synthesis.

Stop when:

- every participant returns `additional_questions: []`
- every participant returns `ready_for_synthesis: true`
- Research Lead confirms no blocking contradiction remains

Hard stop:

- If `round_number` reaches 20, stop the debate loop.
- Preserve unresolved questions.
- Move to Synthesizer with `round_cap_reached: true`.
- Do not silently continue as a new loop.

## Round Output Contract

Each debate round must produce:

```yaml
round_number: integer
max_rounds: 20
round_goal: string
participants:
  market_opportunity_pm:
    position: string
    evidence_used:
      - string
    questions_for_others:
      - string
    additional_questions:
      - string
    ready_for_synthesis: boolean
  execution_risk_pm:
    position: string
    evidence_used:
      - string
    questions_for_others:
      - string
    additional_questions:
      - string
    ready_for_synthesis: boolean
  kimi_pm:
    position: string
    evidence_used:
      - string
    questions_for_others:
      - string
    additional_questions:
      - string
    ready_for_synthesis: boolean
research_lead_moderation:
  contradictions:
    - string
  decisions_needed:
    - string
  continue_debate: boolean
  continuation_reason: string
round_cap_reached: boolean
```

## Question Handling

Questions are not optional decoration. If a participant asks a question, the next round must address it or explicitly mark it as deferred with a reason.

Each round after round 1 must include:

```yaml
answered_questions:
  - question: string
    answer: string
    answered_by: string
deferred_questions:
  - question: string
    reason: string
```

## Synthesis Handoff

When the loop stops, Research Lead sends Synthesizer:

```yaml
debate_rounds_completed: integer
round_cap_reached: boolean
participants_ready_for_synthesis: boolean
resolved_points:
  - string
unresolved_questions:
  - string
decision_options:
  - option: string
    supporting_arguments:
      - string
    risks:
      - string
kimi_pm_final_position: string
market_opportunity_pm_final_position: string
execution_risk_pm_final_position: string
```

Synthesizer must preserve unresolved questions. CSO and QA must see whether the debate ended because all participants were ready or because the 20-round cap was reached.

## Artifact Layout

For KIMI-active harness-making runs, write:

```text
output/harness-runs/<run-id>/harness-maker/
  kimi/
    collaborator-critique.yaml
  pm-debate/
    rounds/
      round-01.yaml
      round-02.yaml
      ...
    debate-summary.yaml
```

For no-KIMI or local-only runs, record why the KIMI phases were skipped.

## Validation Rules

A KIMI-active research or harness-making run is not ready for synthesis unless:

- collaborator critique exists
- KIMI PM appears as a debate participant
- every completed round has `round_number` and `max_rounds: 20`
- every participant has `additional_questions` and `ready_for_synthesis`
- round continuation or stop reason is explicit
- questions from a prior round are answered or deferred
- `round_cap_reached` is recorded
- unresolved questions are preserved for Synthesizer, CSO, QA, and operator review
