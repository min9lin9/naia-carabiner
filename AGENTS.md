# AGENTS.md

Status: active canonical
Role: operator contract
Scope: `~/Document/har-maker`

## Mission

This workspace builds a handoff-ready PM research harness. Treat this as a harness-making workspace, not as the final downstream project workspace.

## Canonical Files

- `docs/harness/harness-reference-and-variant-policy.md` - reference hierarchy and variant selection
- `docs/harness/kimi-pm-linear-paperclip-harness-spec.md` - operating harness contract
- `docs/superpowers/specs/2026-05-20-research-lead-agent-design.md` - Research Lead design
- `docs/harness/templates/prompts/research-lead.md` - Research Lead prompt template
- `docs/harness/kimi-pm-linear-paperclip-harness-bootstrap-handoff-run.md` - bootstrap/handoff run contract

## Variant Policy

- Use KIMI-active mode when the request benefits from KIMI CLI as a trusted full-access collaborator.
- Use no-KIMI mode when the user requests it or privacy, policy, cost, or availability constraints require it.
- Every run records `harness_variant`, `variant_source_prompt`, `purpose_variant`, `kimi_cli_decision`, and `kimi_cli_reason`.

## Source of Truth

- Linear: final results, decisions, approvals, risk acceptance, assumptions, and summaries.
- Paperclip: agent runtime, run status, transcripts, waiting states, and operational governance.
- GitHub: code artifacts, PRs, checks, diffs, commits, and validation evidence when code changes.
- KIMI: trusted collaborator work product, not the official record.

## Working Rules

- Do not treat this as an unbounded self-development loop.
- Produce downstream handoff packets for other chats or work sessions.
- Preserve Research Lead as coordinator.
- Preserve PM debate, Synthesizer, CSO, and QA as separate roles.
- Do not let KIMI replace PM debate, Synthesizer, CSO, QA, Linear records, Paperclip records, or operator approval.
- Do not write real Linear or Paperclip records without operator approval.

## Required First Action

Before starting a run, classify:

```yaml
harness_variant: kimi-active | no-kimi | local-only
variant_source_prompt: string
purpose_variant: research | product_decision | implementation | release | bootstrap_handoff | local_only
task_profile: trivial | normal | ui | runtime | research | high-risk
friction_level: 1 | 2 | 3
kimi_cli_decision: use | skip
kimi_cli_reason: string
```
