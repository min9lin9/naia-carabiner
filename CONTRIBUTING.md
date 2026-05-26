# Contributing

`naia-carabiner` is a harness/proof package for auth and runtime integration work around `nextain/naia-agent`. Keep changes small, reproducible, and easy to lift upstream.

## Contribution Scope

Good first contribution targets:

- auth profile resolution in `src/index.ts`;
- CLI output behavior in `src/cli.ts`;
- regression tests in `tests/auth-profiles.test.ts`;
- provider manifests under `manifests/`;
- harness and upstream contribution docs under `docs/harness/`.

Do not duplicate provider implementations from `nextain/naia-agent`. This repo should prove contracts, safety checks, and migration paths.

## Local Checks

Run these before opening a PR:

```sh
node --test tests/auth-profiles.test.ts
npm run typecheck
node tools/security-scan.mjs .
node tools/validate-harness-run.mjs .
node tools/validate-fixtures.mjs
```

`bun` is the intended runtime. In environments where Bun is installed, also run:

```sh
bun test
```

## Security Rules

- Never commit API keys, login tokens, `.env` files, or exported session state.
- Use `KIMI_API_KEY` for Kimi Code API-key mode.
- Use `OPENAI_API_KEY` for OpenAI API-key mode.
- Use `codex-sdk` for ChatGPT/Codex login based local agent control.
- Keep manifests free of secrets. They may contain provider base URLs and host allowlists only.
- Run `node tools/security-scan.mjs .` after editing docs, manifests, or auth code.

## Documentation Rules

Update docs in the same PR when behavior changes:

- `README.md` for user-facing commands and entry points.
- `docs/harness/provider-auth-runbook.md` for operator behavior.
- `docs/harness/upstream-naia-agent-pr-plan.md` for upstream contribution shape.
- `docs/harness/adr-0001-auth-runtime-boundary.md` when the auth/runtime boundary changes.
- `docs/harness/level-3-security-review.md` for Level 3 security findings.

Use source handles such as `$HARNESS_ROOT` and `$CODEX_REFERENCE_ROOT` instead of user-specific absolute paths.

## Pull Request Shape

Prefer PRs that include:

- concise problem statement;
- changed auth profile or manifest behavior;
- security impact;
- verification commands and results;
- rollback path.

For `nextain/naia-agent`, the expected upstream change is a thin provider/auth contract and UI selector, not a copy of this harness.
