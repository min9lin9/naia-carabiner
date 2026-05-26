import assert from "node:assert/strict";
import test from "node:test";

import { probeAuthProfile } from "../src/probe.ts";

const liveEnabled = process.env.NAIA_CARABINER_LIVE === "1";

test("live naia-agent KIMI smoke probe", { skip: liveEnabled ? false : "set NAIA_CARABINER_LIVE=1, NAIA_AGENT_BIN, and KIMI_API_KEY" }, async () => {
  const result = await probeAuthProfile({ kind: "kimi-api-key" }, { live: true });

  assert.equal(result.ok, true, JSON.stringify(result, null, 2));
});

test("live Codex SDK smoke probe", { skip: liveEnabled ? false : "set NAIA_CARABINER_LIVE=1 and a valid Codex login/API-key environment" }, async () => {
  const result = await probeAuthProfile({ kind: "codex-sdk" }, { live: true });

  assert.equal(result.ok, true, JSON.stringify(result, null, 2));
});
