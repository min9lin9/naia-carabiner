# OSS Auth Provider Research

Status: initial scan
Date: 2026-05-26

## Reference Patterns

| Project | Useful pattern | Relevance to naia-carabiner |
| --- | --- | --- |
| LiteLLM | Normalizes many providers behind an OpenAI-format gateway. | Confirms provider fan-out should be behind an adapter/gateway boundary, not repeated across tools. |
| Vercel AI SDK | Provider packages expose model adapters under a common client shape. | Matches `nextain/naia-agent` current `VercelClient` direction. Prefer adding provider metadata/config over custom HTTP clients. |
| Cline | Presents many provider choices, including OpenAI-compatible APIs and local models. | Supports the idea that provider selection may need one user-facing UI/config surface. |
| Continue | Separates assistant/model configuration from editor/runtime behavior. | Reinforces config-first provider routing and workspace-level governance. |
| Aider | Lets users select models and supply provider-specific keys through CLI/config. | Good CLI precedent for explicit provider selection without embedding secrets in repo files. |
| OpenCode | Coding-agent UX with provider/auth configuration as a first-class surface. | Useful comparator for how agent tools expose provider choice without forking core runtime logic. |

## Decision Rules

- Do not fork or copy provider client logic into naia-carabiner.
- Treat naia-carabiner as a harness and evidence generator.
- Keep raw credentials in host environment or secure local stores only.
- Emit manifests/config references, not secrets.
- Prefer upstream contributions to `nextain/naia-agent` when runtime behavior changes.
- Consider `naia-os` UI only after CLI/config flow is stable.

## nextain Contribution Assessment

`nextain/naia-agent` is public and Apache-2.0 licensed. A contributor path is
feasible through fork + pull request, but becoming a recognized contributor
depends on maintainers accepting a PR.

Observed PR expectations:

- Summary and test plan.
- `pnpm build` and `pnpm test` passing.
- Changelog entry for slice PRs.
- Commit message with matrix ID.
- Harness sync check when `AGENTS.md` changes.

## Likely Upstream Shape

1. Add or update provider registry metadata for Kimi Code and Codex SDK profile
   semantics.
2. Keep OpenAI-compatible API-key behavior in existing service manifest /
   VercelClient path.
3. Add CLI/config resolution for `KIMI_API_KEY`,
   `https://api.kimi.com/coding/v1`, and `kimi-for-coding`.
4. Treat `@openai/codex-sdk` as a local Codex agent-control backend, not an
   OpenAI-compatible LLM endpoint.
5. Add UI only if `naia-os` needs provider selection beyond existing config.
