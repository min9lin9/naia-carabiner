# Level 3 Security Review

Date: 2026-05-26
Status: completed for the current harness layer
Classification: Level 3, because this repository handles authentication profiles, secrets by reference, external LLM routing, public GitHub publication, and future upstream contribution work.

## Scope

Reviewed surfaces:

- `src/index.ts` auth profile resolution and naia-agent manifest generation.
- `src/cli.ts` profile, manifest, and env output paths.
- `manifests/*.service.json` checked-in provider examples.
- Public documentation, source handles, and harness governance files.
- `package.json` dependency reproducibility.
- Kimi Code, OpenAI API-key, and Codex SDK login based execution modes.

No live Kimi, OpenAI, or Codex model calls were made during this review.

## Assets

- API-key environment variables: `KIMI_API_KEY`, `OPENAI_API_KEY`, and local provider-specific key names.
- ChatGPT/Codex login/session state used by `@openai/codex-sdk`.
- naia-agent service manifests and allowlisted provider hosts.
- Private workspace context that could be sent to external model providers.
- Public GitHub history and Linear planning records.

## Trust Boundaries

- Local harness code to external OpenAI-compatible HTTPS endpoints.
- Local harness code to local loopback provider endpoints.
- Local Codex SDK control to user-authenticated Codex/ChatGPT session state.
- Public repository contents to unknown external readers.
- Planned upstream contribution boundary into `nextain/naia-agent`.

## Findings And Actions

| ID | Severity | Finding | Action |
| --- | --- | --- | --- |
| L3-001 | High | Provider `baseURL` accepted any parsed URL, including embedded userinfo or non-HTTP schemes. | Added strict URL validation: no userinfo, only `https`, with `http` allowed only for loopback hosts. |
| L3-002 | Medium | `buildNaiaServiceManifest` trusted hand-constructed `AuthProfile` objects and could bypass resolver URL checks. | Manifest builder now revalidates `profile.baseURL` before emitting it. |
| L3-003 | Medium | Invalid `apiKeyEnv` errors echoed the rejected value, which could reveal a pasted raw key. | Error message now reports only the validation rule. |
| L3-004 | Medium | `package.json` used `latest` for runtime and dev dependencies. | Pinned current npm versions: `@openai/codex-sdk` 0.133.0, `@types/bun` 1.3.14, `@types/node` 25.9.1, `typescript` 6.0.3. |
| L3-005 | Medium | Public harness docs retained user-specific local absolute paths from the bootstrap bundle. | Replaced them with `$HARNESS_ROOT` and `$CODEX_REFERENCE_ROOT` handles. |
| L3-006 | Medium | Kimi PM debate was requested but direct external execution was blocked by local policy. | Preserved a documented gate and did not claim Kimi participated. External debate remains blocked until an approved redaction/execution protocol exists. |
| L3-007 | Low | Secret scanning was manual. | Added `tools/security-scan.ts` and `npm run security:scan`. |
| L3-008 | Medium | Runtime CLI input could cast an unsupported profile kind into the typed resolver path. | Added runtime auth profile kind validation and a regression test. |

## Residual Risk

- Bun is the intended package manager/runtime, but Bun is not installed in the current environment, so `bun test` and a Bun lockfile were not generated here.
- Live `nextain/naia-agent` smoke tests are now available but still require explicit `NAIA_CARABINER_LIVE=1` and `NAIA_AGENT_BIN` opt-in.
- `@openai/codex-sdk` integration now has package-import preflight and opt-in live smoke coverage; full upstream session lifecycle remains a future `naia-agent` boundary decision.
- Kimi external review/debate remains policy-blocked in this environment despite operator intent.

## Contributor Readiness

This harness is now safer to present upstream because it:

- separates Kimi API-key, OpenAI API-key, and Codex login modes;
- keeps raw secrets out of manifests and docs;
- rejects unsafe provider URLs;
- pins dependency versions;
- documents external processing policy;
- has regression tests for auth and URL safety;
- includes a local security scan for public repo hygiene.

Before opening a `nextain/naia-agent` PR, add a thin upstream provider adapter and UI selector rather than copying provider implementations into this repository. The likely upstream shape is still: provider contract in `naia-agent`, UI surface for selecting the auth mode, and this repository as the reproducible harness/proof package.
