# Research Reference Corpus

Status: active canonical
Role: reference corpus policy
Scope: `/Users/burt/Documents/har-maker`

## Purpose

This document defines the source corpus that must be considered when creating or changing a research harness.

The corpus is not limited to bio BD. Bio BD documents are useful as high-rigor research format precedents, but research harnesses must also account for finance research, company research, and the content and presentation patterns of free global reports.

## Required Source Roots

### Foundation Harness Prompt

Primary source prompt:

`/Users/burt/Documents/Codex/2026-05-15/gpt-5-5-prompt-enhancement-users/prompt-versions/ai-harness-prompt.v1.4.1.md`

Use this as the upstream harness prompt reference when checking whether local contracts preserve intended behavior.

### KIMI PM Linear AI Docs

Primary docs root:

`/Users/burt/Documents/Codex/2026-05-18/2-kimi-cli-pm-linear-ai/docs/`

Use this as a required reference corpus for research harness work, not as a bio BD-only source.

Important categories inside this docs root:

- Cockpit architecture: canonical index, object model, state machine, validation rules, view model, source policy, schema extraction, and outcome learning loop.
- Research lead and startup prompts: role boundaries, routing, first action, and stop rules.
- Global BD research formats: useful as examples of output discipline, source handling, stakeholder framing, and decision-ready synthesis.
- Practicality and evaluation documents: useful as examples of review criteria and operator-facing usefulness checks.

## Required Research Format Families

When designing a research harness, inspect or collect examples from these format families:

1. Global BD research formats
2. Finance research formats
3. Company research formats
4. Industry or market research formats
5. Free global report formats
6. Operator-facing decision briefs

The harness must not assume that BD format is the only valid research style. BD examples should inform rigor and synthesis, while finance, company, and global-report examples should inform structure, evidence handling, visual hierarchy, assumptions, risk language, and executive usability.

## Finance Research Format Guidance

Finance research references should inform:

- thesis-first summary structure
- catalyst and risk framing
- market context and peer comparison
- assumptions and sensitivity language
- valuation or metric caveats when relevant
- clear separation between facts, estimates, and judgment

Do not present generated research as investment advice. Require source dates, assumptions, and uncertainty labels for financial claims.

## Company Research Format Guidance

Company research references should inform:

- company snapshot
- business model and segment structure
- customer, channel, and competitor framing
- operating metrics
- strategic initiatives
- risks and open questions
- evidence table with source quality and date

## Free Global Report Guidance

Free global reports are useful for content structure and communication patterns. Relevant examples include public reports from multilateral institutions, public agencies, standards bodies, academic centers, think tanks, and reputable industry publishers.

Use them to learn:

- executive summary shape
- section sequencing
- chart/table conventions
- methodology disclosure
- regional or sector segmentation
- limitations and confidence language
- appendix and source-note style

For a live research run, collect current report examples with dates and links before relying on their facts. For harness design, treat these reports as format and evidence-quality references unless the operator asks for current market facts.

## Reference Selection Rules

Every research-harness design run must record:

```yaml
reference_corpus:
  foundation_prompt: string
  kimi_pm_linear_docs_root: string
  format_families_considered:
    - global_bd
    - finance
    - company
    - industry_market
    - free_global_reports
  selected_references:
    - path_or_url: string
      reason: string
      used_for: structure | evidence_policy | role_design | output_format | validation | examples
  omitted_references:
    - path_or_url: string
      reason: string
```

If a format family is omitted, record why. Convenience is not enough reason to omit finance, company, or free global-report references from a general-purpose research harness.

## Validation Rules

A research harness package is not ready for handoff unless:

- the foundation prompt path is recorded
- the KIMI PM Linear AI docs root is recorded
- the design states how BD formats are used outside bio BD
- finance research format considerations are recorded
- company research format considerations are recorded
- free global-report format considerations are recorded
- live factual claims are separated from format references
- source dates are required for current research facts
