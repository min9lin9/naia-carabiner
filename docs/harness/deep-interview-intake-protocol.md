# Deep Interview Intake Protocol

Status: active canonical
Role: intake clarification protocol
Scope: `$HARNESS_ROOT`
Source skill: `https://github.com/devbrother2024/skills/blob/main/deep-interview/SKILL.md`

## Purpose

This protocol applies the Deep Interview skill to harness-making and research-harness runs.

Deep Interview is an intake gate for ambiguous requests. It turns rough, broad, or underspecified operator requests into actionable requirements before KIMI critique, PM-level debate, synthesis, CSO review, or QA review.

## Core Rule

Do not use Deep Interview to slow down clear work.

Use it when the goal, scope, constraints, completion criteria, or impact surface is unclear. Skip it for precise edits, typo fixes, small manifest updates, direct validation requests, and other work where asking the operator adds little value.

## Placement In The Harness

Every run still starts with the required first-action classification from `AGENTS.md`.

After the initial classification, Research Lead decides:

```yaml
deep_interview_required: true | false
deep_interview_reason: string
```

If `deep_interview_required: true`, run the Deep Interview gate before final intake normalization, KIMI collaborator critique, or PM-level debate.

## Question Axes

Pick the single most important unclear axis:

1. Goal
2. Scope and non-scope
3. Constraints
4. Completion criteria
5. Existing context and impact surface

Do not ask the operator questions that can be answered by inspecting the workspace, required files, manifests, or prior run artifacts.

## Question Format

Ask one question at a time.

Use this format:

```markdown
현재 이해: <요청을 한 문장으로 요약>
막힌 결정: <가장 중요한 불확실성>
추천 답안: <있으면 제시>
질문: <한 가지 질문>
```

When choices help, provide two or three options and allow free-form input.

## Loop Rules

After each answer:

- update the decided facts
- identify the next largest uncertainty
- ask another question only if the uncertainty blocks useful execution

Do not ask questions just to make the intake look thorough. The goal is executable clarity, not a long interview transcript.

## Exit Criteria

Stop Deep Interview when these fields are clear enough to route work:

```yaml
deep_interview_summary:
  goal: string
  scope:
    included:
      - string
    excluded:
      - string
  constraints:
    - string
  completion_criteria:
    - string
  existing_context_and_impact:
    - string
  open_questions:
    - string
```

Open questions may remain. Preserve them explicitly instead of forcing artificial certainty.

## Handoff To The Harness

After Deep Interview exits, Research Lead updates:

```yaml
normalized_goal: string
purpose_variant: research | product_decision | implementation | release | bootstrap_handoff | local_only
task_profile: trivial | normal | ui | runtime | research | high-risk
friction_level: 1 | 2 | 3
kimi_cli_decision: use | skip
kimi_cli_reason: string
deep_interview_required: true
deep_interview_summary:
  goal: string
  scope:
    included:
      - string
    excluded:
      - string
  constraints:
    - string
  completion_criteria:
    - string
  open_questions:
    - string
```

Then continue to variant classification, optional KIMI collaborator critique, PM-level iterative debate, synthesis, CSO review, QA review, and operator decision.

## Artifact Layout

For runs that use Deep Interview, write:

```text
output/harness-runs/<run-id>/harness-maker/deep-interview/
  questions.yaml
  summary.yaml
```

For runs that skip Deep Interview, record `deep_interview_required: false` and `deep_interview_reason` in `classification.yaml` or `intake.md`.

## Validation Rules

A run that uses Deep Interview is not ready for KIMI critique or PM-level debate unless:

- one-question-at-a-time format was used
- goal is recorded
- included and excluded scope are recorded
- constraints are recorded
- completion criteria are recorded
- open questions are recorded, even if empty
- final classification is updated after the interview

A run that skips Deep Interview is valid only if it records a clear skip reason.
