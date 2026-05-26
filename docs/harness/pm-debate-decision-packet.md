# PM Debate Decision Packet

Status: KIMI external call blocked by local execution policy
Date: 2026-05-26

## Requested Debate

The operator requested a PM + KIMI debate with up to 20 rounds.

## Execution Result

The local execution policy rejected sending private workspace and planning
context to KIMI. This project must not claim KIMI participated until an approved
redaction or external-call path exists.

## Internal Debate Summary

| Round | Ambition PM | Execution PM | Security/OSS PM | Decision |
| --- | --- | --- | --- | --- |
| 1 | Support all three auth paths: Kimi Code, OpenAI API, Codex login. | Keep the first contract small and testable. | Do not store raw secrets. | Keep profile resolver as the first artifact. |
| 2 | Upstream provider support should land in `nextain/naia-agent`. | Use naia-carabiner as staging harness, not a forked runtime. | Avoid duplicating provider client code. | Contribute adapter/config changes upstream later. |
| 3 | A UI surface may improve adoption. | Validate CLI/config path first. | UI must not store plaintext credentials. | Delay UI until provider boundary is proven. |
| 4 | KIMI should critique architecture. | Current execution policy blocks private context. | External calls require redaction protocol. | Track KIMI debate gate as Linear issue MIN-119. |
| 5 | Public repo creates visibility. | Use canonical repo name `naia-carabiner`. | Public repo needs secret scan and README. | Publish initial harness publicly. |

Stable after 5 rounds; no need to continue to 20.

## Architecture Decision

Use naia-carabiner as an auth/runtime harness that emits safe profiles:

- `kimi-api-key`: Kimi Code OpenAI-compatible API.
- `openai-api-key`: OpenAI API-key profile and service manifest.
- `codex-sdk`: ChatGPT/Codex login profile using `@openai/codex-sdk`.
- `gpt-auth`: legacy alias for `codex-sdk`.

Provider implementation should not be duplicated in this repo. Changes that
affect runtime provider registration should target `nextain/naia-agent`.

## Next Steps

1. Finish OSS provider/auth pattern research.
2. Map upstream file/package targets in `nextain/naia-agent`.
3. Decide whether a `naia-os` UI selector is needed.
4. Define an approved KIMI redaction protocol before external debate resumes.
5. Prepare a small upstream PR plan with tests and changelog expectations.
