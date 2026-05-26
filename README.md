# naia-carabiner

Bun + TypeScript auth/runtime harness for `nextain/naia-agent`.

## Goal

Provide a small, testable carabiner between local harness work and upstream
agent runtimes without duplicating provider implementations.

Supported profile families:

- `kimi-api-key`: Kimi Code API via `KIMI_API_KEY`,
  `https://api.kimi.com/coding/v1`, and `kimi-for-coding`.
- `openai-api-key`: OpenAI API via `OPENAI_API_KEY` and a
  `naia-agent` service manifest.
- `codex-sdk`: ChatGPT/Codex login based execution via
  `@openai/codex-sdk`, with no API key material in repo files.
- `gpt-auth`: legacy alias for `codex-sdk`.

## Commands

```sh
node --test tests/auth-profiles.test.ts
node src/cli.ts kimi-api-key --format manifest
node src/cli.ts kimi-api-key --format env
node src/cli.ts openai-api-key --format manifest
node src/cli.ts openai-api-key --format env
node src/cli.ts codex-sdk --format profile
node tools/validate-harness-run.mjs .
```

`bun` is the intended runtime, but the current tests also run with Node's
built-in test runner.

## Secret Policy

Manifests and docs must contain only environment variable references, never raw
API keys or login tokens.
