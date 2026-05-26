# Harness Reference and Variant Policy

Status: draft v0.1
Date: 2026-05-20

## Goal

Define which references guide the harness and how to derive request-specific harness variants, including KIMI-active and no-KIMI modes.

## Reference Priority

### Tier 1: Local Canonical Harness Sources

Use these first:

- `/Users/burt/Documents/Codex/2026-05-15/gpt-5-5-prompt-enhancement-users/prompt-versions/ai-harness-prompt.v1.4.1.md`
- `/Users/burt/Documents/Codex/2026-05-15/gpt-5-5-prompt-enhancement-users/prompt-versions/ai-harness-prompt.v1.4.1-no-kimi.md`
- `docs/harness/kimi-pm-linear-paperclip-harness-spec.md`
- `docs/superpowers/specs/2026-05-20-research-lead-agent-design.md`
- `docs/harness/kimi-pm-linear-paperclip-harness-bootstrap-handoff-run.md`

Rules:

- `ai-harness-prompt.v1.4.1.md` is the default source for KIMI-active variants.
- `ai-harness-prompt.v1.4.1-no-kimi.md` is the default source for no-KIMI variants.
- The repo-local harness spec is the operating contract for this workspace.
- The Research Lead design defines the coordinator role.
- The bootstrap/handoff run defines how to package the harness for another chat.

### Tier 2: Frontier Lab and Platform Official Docs

Use official docs as design evidence for platform behavior, agent architecture, tool use, observability, and runtime boundaries.

Reference map:

| Source | Use For | Harness Implication |
| --- | --- | --- |
| OpenAI Agents SDK docs | Agents that plan, call tools, collaborate across specialists, and keep state | Keep orchestration, approvals, and state as explicit harness responsibilities. |
| OpenAI prompt engineering docs | Versioned prompts, evals, model snapshot differences, reasoning/task fit | Version prompt templates and test prompt behavior before promoting changes. |
| Anthropic Building Effective Agents | Simple composable patterns, workflow vs agent distinction, tool quality | Prefer explicit workflows until autonomy is justified. Keep tools well-described and testable. |
| Claude Code best practices | Agentic coding workflow, verification, context management | Give agents validation hooks and manage context as a scarce resource. |
| Google ADK docs | Deployable agents, observability, auth, enterprise runtime | Treat tracing, auth, deployment, and local-to-cloud portability as first-class design concerns. |
| Google Gemini API docs | thinking controls, structured outputs, multimodal inputs, tool/function calling | Use structured outputs for agent handoffs and allow model-specific thinking/latency tradeoffs. |
| Kimi Code docs | Terminal agent that reads/edits code, runs shell commands, searches/scrapes web, plans and adjusts | KIMI-active mode may trust KIMI as a full-access collaborator, while durable side effects remain tracked. |
| Kimi API tool-use docs | Tool/function calling behavior | KIMI API lane can be used for read-only or tool-mediated analysis when CLI is unnecessary. |
| Mistral docs | Agents, RAG, workflows, code terminal workflows | Support reusable agents and durable workflows as separate variants from research-only runs. |
| Microsoft Agent Framework docs | Explicit multi-agent orchestration, state, telemetry, human-in-loop | Keep state machine, telemetry, and waiting states explicit. |
| xAI function calling docs | Built-in tools plus custom function calling and parallel calls | Controller must process multiple tool calls deterministically before continuing. |
| DeepSeek function calling docs | Function calling and strict JSON schema validation | Prefer strict schemas for adapter and tool contracts when supported. |

### Tier 3: Expert Commentary

Use well-known AI practitioner commentary for design philosophy only. Do not treat commentary as an operational rule unless it is converted into a local harness rule and reviewed.

Current expert references:

- Andrej Karpathy's Software 3.0 / LLM-as-OS framing: useful for thinking about language as the interface, context as memory, tools as peripherals, and the operator as system director.
- Karpathy's caution about current agent reliability: useful as a counterweight against over-autonomous self-development and unbounded agent loops.

Rules:

- Expert commentary may justify design direction.
- Expert commentary must not override local operator decisions.
- Expert commentary must not override official platform docs for tool behavior.
- If a commentary-derived idea increases friction, name the task profile where it applies.

## Variant Families

### KIMI-Active Variant

Base source:

- `ai-harness-prompt.v1.4.1.md`

Use when:

- the user explicitly wants KIMI
- the task is planning-heavy
- the task needs long-context critique
- the task benefits from independent review
- Level 2 or Level 3 work needs stronger evidence or challenge

Planning model:

```text
Ambition PM pressure
+ Execution PM pressure
+ KIMI pressure
-> Synthesizer
-> Decision Object
```

Rules:

- KIMI is trusted collaborator work product, not the source of truth.
- KIMI must not replace PM debate, Synthesizer, CSO, QA, Linear records, Paperclip records, or operator approval.
- KIMI conflicts with PM/CSO/QA/Linear/user instruction must become a Human Decision Packet.

### No-KIMI Variant

Base source:

- `ai-harness-prompt.v1.4.1-no-kimi.md`

Use when:

- the user explicitly says not to use KIMI
- the request has privacy, cost, availability, or policy constraints
- a local-only or Codex-only run is preferred
- KIMI would add friction without improving evidence quality

Planning model:

```text
Ambition PM pressure
+ Execution PM pressure
-> Synthesizer
-> Decision Object
```

Rules:

- Do not route planning, drafting, review, implementation proposals, debugging, evidence analysis, or release-readiness checks to KIMI.
- Do not introduce a replacement external AI collaborator unless the user changes the architecture.
- Replace the removed KIMI lane with stronger Codex review, GStack review, GitHub evidence, Linear records, and human approval.

### Purpose-Specific Variants

#### Research / Product Decision

Default:

```yaml
task_profile: research
friction_level: 2
default_kimi_mode: consider
required_outputs:
  - Research Brief
  - PRD or Decision Object
  - Decision Log
  - Linear issue set when execution follows
```

Use PM debate, Synthesizer, Evidence Gate, and Linear decision record.

#### Implementation / Coding

Default:

```yaml
task_profile: normal | runtime
friction_level: 1
default_kimi_mode: optional
required_outputs:
  - implementation summary
  - validation evidence
  - GitHub evidence when code changed
```

Escalate to Level 2 when architecture or product judgment appears. Escalate to Level 3 when production, deployment, security, privacy, credentials, or irreversible operations appear.

#### High-Risk / Release

Default:

```yaml
task_profile: high-risk
friction_level: 3
default_kimi_mode: use_when_available
required_outputs:
  - CSO verdict
  - QA verdict
  - rollback or recovery plan
  - approval or risk acceptance
  - validation evidence
  - residual risk record
```

KIMI-active mode should use KIMI for independent review or release-readiness challenge. No-KIMI mode must replace this with GStack, Codex review, and stricter evidence.

#### Bootstrap / Handoff

Default:

```yaml
task_profile: research
friction_level: 2
default_kimi_mode: consider
required_outputs:
  - downstream-chat-brief.md
  - required-files.yaml
  - startup-prompt.md
  - operator-checklist.md
```

This mode creates a package for another chat or work session. It is not an unlimited self-development loop.

#### Local-Only / Private

Default:

```yaml
task_profile: research | normal
friction_level: 1 | 2
default_kimi_mode: skip
required_outputs:
  - local run artifacts
  - assumptions
  - validation status
```

Use when external services are unavailable or intentionally avoided. Record that Linear/Paperclip/GitHub evidence is deferred or unavailable.

## Variant Selection Algorithm

Research Lead must choose a variant before routing work.

```yaml
inputs:
  user_requested_kimi: true | false | unspecified
  privacy_or_policy_constraint: true | false
  task_profile: trivial | normal | ui | runtime | research | high-risk
  friction_level: 1 | 2 | 3
  purpose: research | product_decision | implementation | release | bootstrap_handoff | local_only
```

Decision rules:

1. If the user explicitly says no KIMI, choose no-KIMI.
2. If privacy, cost, availability, or policy constraints block KIMI, choose no-KIMI and record the reason.
3. If the user explicitly requests KIMI, choose KIMI-active unless it conflicts with a higher-priority constraint.
4. If friction level is 2, consider KIMI by default and record use or skip reason.
5. If friction level is 3, use KIMI by default when available for independent review, unless no-KIMI constraints apply.
6. If the task is Level 1 and simple, skip KIMI unless requested or the context is too large.

Every run records:

```yaml
harness_variant: kimi-active | no-kimi | local-only
variant_source_prompt: string
task_profile: string
friction_level: integer
kimi_cli_decision: use | skip
kimi_cli_reason: string
purpose_variant: string
required_evidence:
  - string
```

## Startup Templates

Use these for downstream chats:

- `docs/harness/templates/startup/kimi-active-harness.md`
- `docs/harness/templates/startup/no-kimi-harness.md`

## Promotion Rules

When adding a new variant:

1. Identify the source prompt or official documentation that motivates it.
2. State which task profiles it applies to.
3. State what friction it adds and removes.
4. Define required evidence.
5. Define when KIMI is used or skipped.
6. Add a startup template if the variant is meant for downstream chats.
7. Add an operator checklist entry.

No variant becomes canonical until it has a concrete use case and operator approval.

## Source URLs

- OpenAI Agents SDK: https://developers.openai.com/api/docs/guides/agents
- OpenAI prompt engineering: https://platform.openai.com/docs/guides/prompt-engineering
- Anthropic Building Effective Agents: https://www.anthropic.com/engineering/building-effective-agents
- Claude Code best practices: https://code.claude.com/docs/en/best-practices
- Google Agent Development Kit: https://adk.dev/
- Google Gemini API docs: https://ai.google.dev/gemini-api/docs
- Kimi Code CLI docs: https://www.kimi.com/help/kimi-code/cli-getting-started
- Kimi API tool use docs: https://platform.kimi.ai/docs/api/tool-use
- Mistral AI docs: https://docs.mistral.ai/
- Microsoft Agent Framework: https://learn.microsoft.com/agent-framework/overview/
- xAI function calling docs: https://docs.x.ai/developers/tools/function-calling
- DeepSeek function calling docs: https://api-docs.deepseek.com/guides/function_calling
- Andrej Karpathy Software Is Changing Again reference page: https://yt.chop.dev/en/v/LCEmiRjPEtQ
