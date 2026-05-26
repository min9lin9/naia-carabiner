# Naia Carabiner Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first Bun + TypeScript harness layer that turns the portable harness-maker bundle into a typed local project for `nextain/naia-agent` KIMI/OpenAI-compatible/GPT-auth integration work.

**Architecture:** Keep the extracted harness-maker docs and validation scripts as canonical governance inputs. Add a small TypeScript domain layer that classifies runs, resolves auth profiles without storing secrets, and emits naia-agent-compatible service manifest data. Tests cover configuration and validation behavior before any live model calls.

**Tech Stack:** Bun, TypeScript, Bun test, local JSON/YAML-free structured config, existing Node `.ts` harness validation tools.

---

- [ ] Add Bun/TypeScript project metadata without removing the extracted harness-maker scripts.
- [ ] Define typed auth profile and harness classification contracts.
- [ ] Implement KIMI/OpenAI-compatible profile resolution with safe environment-variable references only.
- [ ] Implement GPT-auth as an explicit external-auth profile that can be routed later without pretending an API key exists.
- [ ] Emit a naia-agent service manifest for OpenAI-compatible providers, including KIMI via `https://api.kimi.com/coding/v1`.
- [ ] Add Bun tests for KIMI defaults, OpenAI-compatible overrides, secret-redaction, and GPT-auth non-secret routing.
- [ ] Add a project run classification and handoff notes for the current bootstrap.
- [ ] Run the test suite, TypeScript check, and existing fixture validation.
