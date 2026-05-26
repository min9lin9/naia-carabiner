# nextain/naia-agent Maintainer Review Request

Status: draft
Audience: `nextain/naia-agent` maintainers
Use: copy this into a GitHub issue, discussion, or draft PR description after operator approval.

## Review Goal

Request maintainer feedback on a small contribution path for adding provider-based auth selection to `nextain/naia-agent`, covering:

- Kimi Code API-key mode;
- OpenAI API-key mode;
- Codex SDK login or API-key mode;
- a minimal UI or CLI selector only where upstream maintainers want it.

This request is not asking for direct write access first. The intended path is maintainer review, then a small draft PR, then broader contributor access only if the first contribution lands and maintainers want ongoing help.

## Current Proof

Proof repository:

- `https://github.com/min9lin9/naia-carabiner`

Prepared evidence:

- Bun and TypeScript project layout;
- all repo-owned JavaScript tools migrated to TypeScript;
- Kimi profile uses the Kimi-specific `KIMI_API_KEY` env reference;
- Kimi endpoint defaults to `https://api.kimi.com/coding/v1`;
- provider URL validation blocks userinfo, unsafe remote HTTP, and malformed env names;
- Codex SDK profile refuses service manifest generation when login-backed runtime mediation is required;
- probe checks exist for Kimi, OpenAI, and Codex modes;
- live `naia-agent` smoke path is opt-in through `NAIA_CARABINER_LIVE=1` and `NAIA_AGENT_BIN`;
- Level 3 security review is documented.

Verification already run locally:

```sh
bun test
npm run ci
npm run ci:harness
npm run probe:codex
env KIMI_API_KEY=kimi-secret-value npm run probe:kimi
node --test tests/*.test.ts
npm run typecheck
node tools/security-scan.ts .
git diff --check
```

Known limitation:

- The full upstream `naia-agent` live smoke test still needs the maintainer-approved upstream command path. The harness supports `NAIA_AGENT_BIN`, but should not claim upstream integration is complete before that command is selected.

## Proposed First PR Scope

Keep the first upstream contribution intentionally small:

- add an auth provider contract or adapter shape;
- add Kimi/OpenAI/Codex profile normalization;
- validate provider endpoint and env-key references before runtime use;
- add docs for API-key and login-backed modes;
- add focused tests and probe checks;
- avoid replacing existing runtime, provider, or UI architecture.

Out of scope for the first PR:

- a new agent runtime;
- a new orchestration system;
- storing API keys or login tokens;
- making Kimi the official record of project decisions;
- broad UI redesign;
- unreviewed live calls in default CI.

## Requested Maintainer Decisions

Ask maintainers to decide:

1. Which upstream package should own provider selection: CLI, host app, runtime-adjacent package, or a new small package?
2. Should the UI selector be included in the first PR or split into a follow-up PR after the provider contract lands?
3. What should be the canonical `NAIA_AGENT_BIN` command for live smoke tests?
4. Should Codex SDK support be an optional peer dependency, a separate package boundary, or an integration behind an existing backend?
5. Should provider allowlists live in manifest validation, host env validation, or both?
6. Is `KIMI_API_KEY` plus `https://api.kimi.com/coding/v1` plus `kimi-for-coding` acceptable as the default Kimi Code profile?

## Draft GitHub Issue

```md
Title: Proposal: provider auth selector for Kimi, OpenAI API key, and Codex SDK login

Hi `naia-agent` maintainers.

I would like to contribute a small provider-auth path for Kimi Code, OpenAI API key, and Codex SDK login/API-key usage.

I prepared a public proof repository here:

https://github.com/min9lin9/naia-carabiner

The proof focuses on a thin auth/runtime harness rather than a replacement runtime. It includes:

- Kimi Code profile using `KIMI_API_KEY`, `https://api.kimi.com/coding/v1`, and `kimi-for-coding`;
- OpenAI API-key profile support;
- Codex SDK profile support with login-backed mode kept out of service manifests;
- provider URL and env reference validation;
- secret redaction checks;
- Bun + TypeScript tests;
- probe/preflight checks;
- Level 3 security review documentation;
- an upstream PR plan.

I would like to keep the first PR small:

- provider/auth contract;
- profile normalization;
- env and endpoint validation;
- docs and tests;
- no broad runtime rewrite;
- no default live external calls in CI.

Maintainer questions:

1. Where should provider selection live: CLI, host app, runtime-adjacent package, or a new small package?
2. Should the UI selector be included in the first PR or split into a follow-up PR?
3. What command should be used as the canonical live smoke target for `NAIA_AGENT_BIN`?
4. Should Codex SDK support be an optional peer dependency, separate package boundary, or integration behind an existing backend?
5. Is the Kimi default of `KIMI_API_KEY` + `https://api.kimi.com/coding/v1` + `kimi-for-coding` acceptable?

If this direction fits the project, I can open a draft PR with only the provider contract, docs, and tests first.
```

## Draft PR Review Request

```md
## Summary

Adds the first slice of provider-auth support for Kimi Code, OpenAI API-key mode, and Codex SDK login/API-key mode.

This PR intentionally keeps the change small: provider/profile normalization, endpoint/env validation, docs, and focused tests. It does not replace the agent runtime or introduce default live external calls in CI.

## Security

- Does not store raw API keys or login tokens.
- Uses env references for API-key modes.
- Rejects provider URLs with userinfo.
- Requires HTTPS for remote provider URLs.
- Allows plain HTTP only for loopback development endpoints.
- Keeps Codex login-backed behavior out of generated service manifests.
- Redacts secret-like values in failure paths.

## Verification

- Bun tests
- TypeScript check
- provider manifest tests
- Kimi/OpenAI/Codex probe checks
- opt-in live smoke path through `NAIA_CARABINER_LIVE=1` and `NAIA_AGENT_BIN`

## Review Focus

- Provider contract location
- UI selector boundary
- Codex SDK dependency boundary
- Kimi default profile values
- Whether validation should live in manifest generation, host runtime, or both
```

## Send Checklist

Before posting this upstream:

- Confirm the proof repo is public and clean.
- Confirm local verification has been rerun after the latest changes.
- Do not include private Linear or Paperclip links unless the operator explicitly approves.
- Do not claim upstream integration is complete until a maintainer-approved `NAIA_AGENT_BIN` path passes live smoke.
- Open an issue or discussion first; request collaborator access only after maintainer interest or an accepted PR.
