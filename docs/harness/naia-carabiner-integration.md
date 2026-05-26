# Naia Carabiner Integration Harness

Status: bootstrap foundation
Date: 2026-05-26

## Classification

```yaml
harness_variant: kimi-active
variant_source_prompt: docs/harness/harness-maker-harness.md + nextain/naia-agent public docs
purpose_variant: implementation
task_profile: runtime
friction_level: 2
kimi_cli_decision: use
kimi_cli_reason: "Operator explicitly requested KIMI and stated KIMI use is not an external-disclosure violation for this work."
deep_interview_required: false
deep_interview_reason: "The requested first step is concrete: build the harness foundation from the provided zip."
compound_extraction_required: true
compound_extraction_reason: "The harness must preserve reusable auth, manifest, and repo-analysis lessons for later naia-agent work."
```

No real Linear or Paperclip records were written during this bootstrap.

## Repository Fit

`nextain/naia-agent` separates the runtime from provider wiring: the agent consumes an injected `LLMClient`, while CLI or host code resolves providers and auth. Its current service manifest v0.1.0 shape uses `schemaVersion`, `name`, `persona.systemPrompt`, `llm.backend`, `llm.model`, optional `llm.baseURL`, and `memory.binding`; secrets must stay in host environment, not in manifests.

`nextain/naia-adk` is the workspace/governance source. `nextain/naia-memory` is the pluggable memory implementation. `nextain/naia-os` is a host surface rather than the runtime target.

## Auth Profiles

KIMI API-key mode uses the official OpenAI-compatible Kimi endpoint:

```sh
export KIMI_API_KEY='...'
export NAIA_SERVICE_API_KEY="$KIMI_API_KEY"
export NAIA_ALLOW_MANIFEST_BASEURL_HOSTS='api.kimi.com'
```

The generated manifest is `manifests/naia-carabiner-kimi.service.json`. It deliberately contains no key material.

OpenAI API-key mode is separate from ChatGPT login. It uses `OPENAI_API_KEY` through host environment only:

```sh
export OPENAI_API_KEY='...'
export NAIA_SERVICE_API_KEY="$OPENAI_API_KEY"
export NAIA_ALLOW_MANIFEST_BASEURL_HOSTS='api.openai.com'
```

The generated manifest is `manifests/naia-carabiner-openai-api.service.json`.

Codex/ChatGPT login mode is `codex-sdk`. It uses the official `@openai/codex-sdk` package to control a local Codex thread and relies on the user's existing Codex/ChatGPT login state. It does not emit a naia-agent service manifest because it is not an OpenAI-compatible LLM endpoint; it is a local Codex agent-control path.

`gpt-auth` is retained as a legacy alias for `codex-sdk` so older harness notes still resolve to the ChatGPT-login path.

## Commands

```sh
bun test
bun run manifest:kimi
bun run env:kimi
bun run manifest:openai
bun run env:openai
bun run profile:codex
node --test tests/auth-profiles.test.ts
node tools/validate-harness-run.ts .
```

`bun` is the intended runtime for this project. `node --test` remains as a local fallback for the current environment when Bun is not installed.
