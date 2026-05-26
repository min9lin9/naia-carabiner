# ADR 0001: Auth Runtime Boundary

Date: 2026-05-26
Status: accepted

## Context

`naia-carabiner` exists to prove an auth/runtime integration path for `nextain/naia-agent` without copying upstream provider implementations. The project must support both API-key providers and Codex/ChatGPT login based local agent control.

API-key providers and Codex login have different trust and runtime shapes:

- Kimi Code and OpenAI API-key modes are OpenAI-compatible HTTP provider paths.
- Codex SDK mode controls a local Codex thread through `@openai/codex-sdk` and relies on the user's existing login state.
- `naia-agent` service manifests should carry provider metadata, not secrets.

## Decision

Keep two backend families:

1. `openai-compatible` for Kimi, OpenAI API-key, and compatible HTTPS or loopback HTTP endpoints.
2. `codex-local-agent` for Codex/ChatGPT login based control through `@openai/codex-sdk`.

The harness may generate `naia-agent` service manifests only for `openai-compatible` profiles. It must reject manifest generation for `codex-local-agent` profiles.

## Consequences

- `kimi-api-key` uses `KIMI_API_KEY`, `https://api.kimi.com/coding/v1`, and `kimi-for-coding`.
- `openai-api-key` uses `OPENAI_API_KEY` and `https://api.openai.com/v1`.
- `codex-sdk` and `gpt-auth` do not need API-key env output and default to the current Codex recommended model family (`gpt-5.5`) until upstream policy changes.
- UI and docs must distinguish API-key auth from ChatGPT/Codex login auth.
- Unsafe provider URLs are rejected before manifest generation.

## Security Requirements

- No raw API keys or login tokens in repository files.
- No embedded credentials in provider URLs.
- Remote OpenAI-compatible providers must use HTTPS.
- Plain HTTP is allowed only for loopback development endpoints.
- Invalid `apiKeyEnv` errors must not echo rejected values.

## Revisit Triggers

Revisit this ADR if:

- `nextain/naia-agent` adds a native Codex login backend;
- Codex SDK changes its authentication model;
- Kimi Code changes its canonical endpoint or key environment guidance;
- service manifests gain a first-class secret reference schema.
