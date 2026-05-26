# Portable Handoff Bundle Layout

Status: active reference
Last updated: 2026-05-25

Purpose:
Make the harness handoff usable on another machine without relying on local absolute paths.

Root rule:

- The directory containing `startup-prompt.md` is `HANDOFF_BUNDLE_ROOT`.
- A receiving agent must resolve files relative to `HANDOFF_BUNDLE_ROOT` first.
- If a full har-maker repository is attached, the receiving agent may set `HARNESS_WORKSPACE_ROOT` by locating `AGENTS.md`, `package.json`, and `docs/harness/`.
- Machine-local absolute paths are source hints only and must not be required for startup.

Recommended transferable directory:

```text
harness-maker-bootstrap-portable/
  START_HERE.md
  AGENTS.md
  package.json
  docs/
  tools/
  schemas/
  fixtures/
  intake.md
  classification.yaml
  proposal/
  reviews/
  archive/
  compound/
  handoff/
    startup-prompt.md
    required-files.yaml
    downstream-chat-brief.md
    operator-checklist.md
    portable-bundle-layout.md
    reference-source-handles.md
  references/
    upstream/
      ai-harness-prompt.v1.4.1.md
      2-kimi-cli-pm-linear-ai/
        docs/
```

Resolution order:

1. Check `HANDOFF_BUNDLE_ROOT`.
2. Check `HARNESS_WORKSPACE_ROOT` if a separate repository was attached.
3. Check operator-provided project roots or SSH targets.
4. If a referenced source is absent, record `source_missing` and continue unless the source is mandatory for the requested decision.

Portable verification commands:

```sh
node tools/validate-harness-run.mjs .
node tools/harness-state-runner.mjs .
node tools/evaluate-research-quality.mjs .
node tools/pre-handoff-gate.mjs .
```

Downstream project rule:

- For an existing project harness, resolve `<target_repo_root>` from the operator-provided repo, SSH target, mounted workspace, or bundled snapshot.
- Use `<target_repo_root>/docs/harness/templates/startup/<project>-codex-startup.md` instead of a machine-specific path.
