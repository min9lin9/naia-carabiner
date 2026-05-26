import assert from "node:assert/strict";
import test from "node:test";

import {
  buildNaiaServiceManifest,
  formatShellEnvPlan,
  redactEnvPlan,
  resolveAuthProfile,
} from "../src/index.ts";

test("KIMI API-key profile defaults to Kimi Code without storing a secret", () => {
  const profile = resolveAuthProfile({ kind: "kimi-api-key" });

  assert.equal(profile.backend, "openai-compatible");
  assert.equal(profile.model, "kimi-for-coding");
  assert.equal(profile.baseURL, "https://api.kimi.com/coding/v1");
  assert.equal(profile.apiKeyEnv, "KIMI_API_KEY");
  assert.deepEqual(profile.allowlistHosts, ["api.kimi.com"]);
  assert.equal(profile.envPlan.NAIA_SERVICE_API_KEY, "$KIMI_API_KEY");
  assert.equal(profile.envPlan.NAIA_ALLOW_MANIFEST_BASEURL_HOSTS, "api.kimi.com");
});

test("OpenAI API-key profile defaults to the OpenAI API without storing a secret", () => {
  const profile = resolveAuthProfile({
    kind: "openai-api-key",
    model: "gpt-4.1",
    baseURL: "https://api.openai.com/v1",
    apiKeyEnv: "OPENAI_API_KEY",
  });

  assert.equal(profile.backend, "openai-compatible");
  assert.equal(profile.model, "gpt-4.1");
  assert.equal(profile.baseURL, "https://api.openai.com/v1");
  assert.deepEqual(profile.allowlistHosts, ["api.openai.com"]);
  assert.equal(profile.envPlan.NAIA_SERVICE_API_KEY, "$OPENAI_API_KEY");
});

test("Codex SDK profile uses ChatGPT/Codex login without API key material", () => {
  const profile = resolveAuthProfile({ kind: "codex-sdk", model: "gpt-5.1-codex" });

  assert.equal(profile.backend, "codex-local-agent");
  assert.equal(profile.model, "gpt-5.1-codex");
  assert.equal(profile.apiKeyEnv, undefined);
  assert.deepEqual(profile.envPlan, {});
  assert.equal(profile.packageName, "@openai/codex-sdk");
  assert.throws(() => buildNaiaServiceManifest(profile), /codex-local-agent/);
});

test("legacy gpt-auth aliases Codex SDK login mode", () => {
  const profile = resolveAuthProfile({ kind: "gpt-auth" });

  assert.equal(profile.backend, "codex-local-agent");
  assert.equal(profile.packageName, "@openai/codex-sdk");
});

test("naia-agent manifest matches v0.1.0 service manifest shape for OpenAI-compatible profiles", () => {
  const profile = resolveAuthProfile({ kind: "kimi-api-key" });
  const manifest = buildNaiaServiceManifest(profile);

  assert.equal(manifest.schemaVersion, "0.1.0");
  assert.equal(manifest.name, "naia-carabiner-kimi");
  assert.equal(manifest.llm.backend, "openai-compatible");
  assert.equal(manifest.llm.model, "kimi-for-coding");
  assert.equal(manifest.llm.baseURL, "https://api.kimi.com/coding/v1");
  assert.equal(manifest.memory.binding, "in-memory");
  assert.match(manifest.persona.systemPrompt, /naia-agent/);
});

test("redaction hides secret-like values while preserving env references", () => {
  const redacted = redactEnvPlan({
    NAIA_SERVICE_API_KEY: "sk-live-secret",
    KIMI_API_KEY: "$KIMI_API_KEY",
    NAIA_ALLOW_MANIFEST_BASEURL_HOSTS: "api.kimi.com",
  });

  assert.equal(redacted.NAIA_SERVICE_API_KEY, "<redacted>");
  assert.equal(redacted.KIMI_API_KEY, "$KIMI_API_KEY");
  assert.equal(redacted.NAIA_ALLOW_MANIFEST_BASEURL_HOSTS, "api.kimi.com");
});


test("shell env output expands env references without printing secrets", () => {
  const lines = formatShellEnvPlan({
    NAIA_SERVICE_API_KEY: "$KIMI_API_KEY",
    NAIA_ALLOW_MANIFEST_BASEURL_HOSTS: "api.kimi.com",
  });

  assert.deepEqual(lines, [
    'export NAIA_SERVICE_API_KEY="${KIMI_API_KEY}"',
    "export NAIA_ALLOW_MANIFEST_BASEURL_HOSTS='api.kimi.com'",
  ]);
});


test("OpenAI API-key profile emits a naia-agent service manifest", () => {
  const profile = resolveAuthProfile({ kind: "openai-api-key" });
  const manifest = buildNaiaServiceManifest(profile);

  assert.equal(profile.envPlan.NAIA_SERVICE_API_KEY, "$OPENAI_API_KEY");
  assert.equal(manifest.name, "naia-carabiner-openai-api");
  assert.equal(manifest.llm.backend, "openai-compatible");
  assert.equal(manifest.llm.model, "gpt-4.1");
  assert.equal(manifest.llm.baseURL, "https://api.openai.com/v1");
});
