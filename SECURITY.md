# Security Policy

## Scope

`naia-carabiner` is an auth/runtime harness for provider selection and manifest generation. It does not execute live model calls by itself and must not persist API keys, ChatGPT/Codex login tokens, or provider credentials in repository files.

## Secret Handling

- Use `KIMI_API_KEY` for Kimi Code API-key mode.
- Use `OPENAI_API_KEY` for OpenAI API-key mode.
- Use `codex-sdk` for ChatGPT/Codex login based local agent control without API-key material.
- Commit environment variable references only, such as `$KIMI_API_KEY`.
- Do not commit `.env`, shell history, raw bearer tokens, exported login state, or generated manifests containing secrets.

## Provider URL Rules

OpenAI-compatible provider profiles must use `https` unless the host is local loopback (`localhost`, `127.*`, or `::1`). Provider URLs with embedded credentials are rejected. Named `kimi-api-key` and `openai-api-key` profiles are fixed to their canonical provider endpoints; custom endpoints must use `openai-compatible` with an explicit provider-specific `apiKeyEnv`. Generated manifests carry only the base URL and host allowlist, not credentials.

## External Model Calls

Kimi and OpenAI API-key profiles represent intentional external processing. Do not route private workspace context to an external model unless the operator has approved that route for the current run. The Codex SDK profile is treated separately as local Codex thread control through the user login/session, not as an OpenAI-compatible LLM endpoint.

## Level 3 Change Gate

Changes touching authentication, secrets, provider routing, manifests, external calls, public publishing, or dependency trust require:

1. Security review with threat model notes.
2. Tests for the auth/profile behavior.
3. `node tools/security-scan.ts .` before publish.
4. A rollback or disable path for the affected profile.
5. Explicit documentation of any residual risk.

## Reporting Vulnerabilities

Prefer a private GitHub security advisory for sensitive reports. If the advisory flow is unavailable, open a minimal public issue that asks for a private maintainer channel and does not include exploit details, secrets, or private workspace data.
