# Reference Source Handles

Status: portable source manifest
Last updated: 2026-05-25

Purpose:
Track external source corpora without binding the handoff bundle to one machine's filesystem.

Source handles:

1. `upstream_foundation_harness_prompt`
   - Preferred bundle candidate: `references/upstream/ai-harness-prompt.v1.4.1.md`
   - Purpose: upstream foundation harness prompt for KIMI-active behavior checks.
   - If absent: record `source_missing`.

2. `kimi_cli_pm_linear_ai_docs`
   - Preferred bundle candidate: `references/upstream/2-kimi-cli-pm-linear-ai/docs/`
   - Purpose: general research-harness corpus covering cockpit architecture, source policy, validation, output formats, and research precedents beyond bio BD.
   - If absent: record `source_missing`.

Rule:
Do not invent machine-local absolute paths for these sources. Use operator-provided paths, bundled copies, mounted workspaces, or explicit `source_missing` records.
