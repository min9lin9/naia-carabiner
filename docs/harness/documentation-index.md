# Documentation Index

This index is the contributor entry point for `naia-carabiner`.

## Start Here

- [README](../../README.md): project goal, supported auth profiles, and commands.
- [Contributing](../../CONTRIBUTING.md): contribution scope, local checks, and PR expectations.
- [Security Policy](../../SECURITY.md): secret handling, provider URL rules, and Level 3 change gate.

## Runtime And Auth

- [Naia Carabiner Integration Harness](./naia-carabiner-integration.md): repository fit and generated profile behavior.
- [Provider Auth Runbook](./provider-auth-runbook.md): operator procedures for Kimi API-key, OpenAI API-key, and Codex SDK login modes.
- [ADR 0001: Auth Runtime Boundary](./adr-0001-auth-runtime-boundary.md): accepted boundary between this harness, external providers, Codex login, and `nextain/naia-agent`.

## Security And Review

- [Level 3 Security Review](./level-3-security-review.md): threat model, findings, mitigations, residual risk, and contributor readiness.
- [OSS Auth Provider Research](./oss-auth-provider-research.md): reference patterns from adjacent open source provider/auth adapter projects.

## Planning Records

- [PM Debate Decision Packet](./pm-debate-decision-packet.md): decision record for Kimi debate gating and first implementation scope.
- [Upstream naia-agent PR Plan](./upstream-naia-agent-pr-plan.md): proposed contribution route into `nextain/naia-agent`.

## Bootstrap Harness References

The remaining files in `docs/harness/`, `proposal/`, `handoff/`, `archive/`, and `compound/` preserve the original harness-maker bootstrap process. Treat them as governance inputs, not as product runtime code.
