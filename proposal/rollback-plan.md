# Rollback Plan

## Scope

This run created local handoff artifacts and relies on the prior operator-approved canonical changes.

## To Roll Back This Handoff Package Only

Remove:

- `output/harness-runs/2026-05-20-harness-maker-bootstrap/harness-maker/`

No external records need rollback because none were written.

## To Roll Back The Prior Canonical Harness-Maker Change

Remove:

- `docs/harness/harness-maker-harness.md`
- `docs/harness/templates/prompts/harness-maker.md`
- `docs/superpowers/plans/2026-05-20-harness-maker-harness.md`

Then restore prior references in:

- `README.md`
- `required-files.yaml`

Because this workspace is not a git repo, rollback should be performed by explicit file edits or from an external backup.

## Re-Entry

After rollback, restart with the required first-action classification from `AGENTS.md` before making new harness changes.
