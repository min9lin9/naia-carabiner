# Upstream naia-agent PR Plan

This document describes how `naia-carabiner` should feed an eventual `nextain/naia-agent` contribution.

## Goal

Add a contributor-grade auth/provider path to `nextain/naia-agent` that supports:

- Kimi Code API-key mode through `KIMI_API_KEY`;
- OpenAI API-key mode through `OPENAI_API_KEY`;
- Codex/ChatGPT login mode through a local Codex SDK control path;
- an explicit UI or host selector for choosing the auth mode.

## Non-Goals

- Do not move raw secrets into service manifests.
- Do not pretend Codex/ChatGPT login is an OpenAI-compatible API-key endpoint.
- Do not duplicate complete provider implementations in this harness.
- Do not send private workspace context to Kimi unless the operator has approved that external route for the current run.

## Proposed Upstream Shape

1. Add a provider/auth contract in `naia-agent` host or runtime boundary.
2. Support a Kimi profile that maps to:
   - base URL: `https://api.kimi.com/coding/v1`
   - model: `kimi-for-coding`
   - key env: `KIMI_API_KEY`
3. Support an OpenAI API-key profile that maps to:
   - base URL: `https://api.openai.com/v1`
   - key env: `OPENAI_API_KEY`
4. Keep Codex SDK login mode as a separate local agent-control backend.
5. Add a UI or host selection surface for choosing between API-key providers and Codex login.
6. Preserve the existing service manifest rule: manifests may contain provider metadata but not secrets.

## PR Slices

| Slice | Description | Evidence From This Repo |
| --- | --- | --- |
| 1 | Provider/auth type contract | `src/index.ts` auth profile types |
| 2 | Kimi/OpenAI-compatible profile resolver | `resolveAuthProfile` tests |
| 3 | Manifest safety checks | URL validation and manifest revalidation tests |
| 4 | UI/host selector | profile family list and runbook |
| 5 | Codex SDK boundary | `codex-sdk` profile and ADR |

## Acceptance Criteria

- Kimi mode uses `KIMI_API_KEY`, not the legacy Moonshot key env name.
- API-key modes reference env vars only.
- Remote provider URLs require HTTPS.
- URLs with embedded credentials are rejected.
- Codex SDK login mode does not emit an API-key service manifest.
- UI copy distinguishes API key auth from ChatGPT/Codex login auth.
- Tests cover Kimi defaults, OpenAI defaults, unsafe URL rejection, redaction, and Codex SDK manifest refusal.

## PR Description Draft

```md
## Summary

Adds an explicit auth/provider selection path for Kimi Code, OpenAI API-key, and Codex SDK login based execution. The implementation keeps secrets in the host environment and prevents Codex login from being treated as an API-key provider.

## Security

- No raw secrets are stored in service manifests.
- Provider URLs reject embedded credentials.
- Remote provider URLs require HTTPS.
- Codex SDK login mode is modeled as local agent control, not an OpenAI-compatible endpoint.

## Verification

- Kimi profile default tests
- OpenAI API-key profile default tests
- unsafe provider URL rejection tests
- manifest generation tests
- Codex SDK manifest refusal tests
```

## Open Questions

- Which `naia-agent` package should own the UI selector: host app, CLI, or runtime-adjacent package?
- Should provider allowlists live in service manifest validation, host env validation, or both?
- Should Codex SDK support be optional peer dependency or a separate package boundary?
