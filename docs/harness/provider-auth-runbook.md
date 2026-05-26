# Provider Auth Runbook

This runbook describes how to operate the current auth profiles without leaking secrets into manifests, docs, logs, or Git history.

## Profiles

| Profile | Auth Source | Endpoint Shape | Manifest |
| --- | --- | --- | --- |
| `kimi-api-key` | `KIMI_API_KEY` | OpenAI-compatible Kimi Code API | yes |
| `openai-api-key` | `OPENAI_API_KEY` | OpenAI API | yes |
| `openai-compatible` | caller-supplied env var | HTTPS remote or loopback HTTP | yes |
| `codex-sdk` | local Codex/ChatGPT login state | `@openai/codex-sdk` local control | no |
| `gpt-auth` | legacy alias | same as `codex-sdk` | no |

## Kimi API-Key Mode

Use this when the operator explicitly wants Kimi Code API-key execution.

```sh
export KIMI_API_KEY=...
node src/cli.ts kimi-api-key --format env
node src/cli.ts kimi-api-key --format manifest
```

Expected behavior:

- generated env output references `${KIMI_API_KEY}`;
- manifest uses `https://api.kimi.com/coding/v1`;
- model defaults to `kimi-for-coding`;
- no raw key is printed by profile or manifest output.

## OpenAI API-Key Mode

Use this when the operator wants OpenAI API-key execution through a `naia-agent` service manifest.

```sh
export OPENAI_API_KEY=...
node src/cli.ts openai-api-key --format env
node src/cli.ts openai-api-key --format manifest
```

Expected behavior:

- generated env output references `${OPENAI_API_KEY}`;
- manifest uses `https://api.openai.com/v1`;
- no raw key is printed by profile or manifest output.

## OpenAI-Compatible Override

Use this for a compatible provider or local test server.

```sh
export LOCAL_API_KEY=...
node src/cli.ts openai-compatible --base-url http://127.0.0.1:11434/v1 --api-key-env LOCAL_API_KEY --format profile
```

Remote provider URLs must use HTTPS. Plain HTTP is allowed only for loopback hosts: `localhost`, `127.*`, or `::1`. URLs with embedded credentials are rejected.

## Codex SDK Login Mode

Use this when the operator wants Codex/ChatGPT login based local agent control.

```sh
node src/cli.ts codex-sdk --format profile
```

Expected behavior:

- profile backend is `codex-local-agent`;
- package is `@openai/codex-sdk`;
- `envPlan` is empty;
- manifest generation is rejected because this is not an OpenAI-compatible LLM endpoint.

## Preflight Checklist

Before publishing or handing off a profile:

```sh
node --test tests/auth-profiles.test.ts
node tools/security-scan.mjs .
```

For Level 3 changes, also run:

```sh
npm run typecheck
node tools/validate-harness-run.mjs .
node tools/validate-fixtures.mjs
```

## Rollback

If a provider profile behaves unexpectedly:

1. Stop using generated env output from the suspect profile.
2. Remove any exported provider key from the current shell.
3. Re-run `node tools/security-scan.mjs .`.
4. Revert only the profile or manifest change that introduced the behavior.
5. Document the issue in `docs/harness/level-3-security-review.md` if it affects authentication, secrets, external calls, or public release readiness.
