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
npm run typecheck
node src/cli.ts kimi-api-key --format manifest
node src/cli.ts kimi-api-key --format env
node src/cli.ts openai-api-key --format manifest
node src/cli.ts openai-api-key --format env
node src/cli.ts codex-sdk --format profile
node src/cli.ts kimi-api-key --format probe
node src/cli.ts codex-sdk --format probe
npm run ci
npm run ci:harness
```

`bun` is the intended runtime, but the current tests also run with Node's
built-in test runner. `npm run ci` is the lightweight contributor gate;
`npm run ci:harness` runs the heavier bootstrap-harness validators.

## Security

Manifests and docs must contain only environment variable references, never raw
API keys or login tokens. Provider URLs are validated to reject embedded
credentials, non-HTTP schemes, and remote plain-HTTP endpoints.

See [SECURITY.md](./SECURITY.md) and
[docs/harness/level-3-security-review.md](./docs/harness/level-3-security-review.md).

## Documentation

- [Documentation Index](./docs/harness/documentation-index.md)
- [Contributing](./CONTRIBUTING.md)
- [Provider Auth Runbook](./docs/harness/provider-auth-runbook.md)
- [Upstream naia-agent PR Plan](./docs/harness/upstream-naia-agent-pr-plan.md)
- [ADR 0001: Auth Runtime Boundary](./docs/harness/adr-0001-auth-runtime-boundary.md)
