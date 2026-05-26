#!/usr/bin/env bun
import {
  buildNaiaServiceManifest,
  formatShellEnvPlan,
  redactEnvPlan,
  resolveAuthProfile,
  type AuthProfileKind,
} from "./index.ts";
import { probeAuthProfile } from "./probe.ts";

try {
  const args = process.argv.slice(2);
  const kind = (args[0] ?? "kimi-api-key") as AuthProfileKind;
  const format = flagValue(args, "--format") ?? "profile";
  const input = {
    kind,
    model: flagValue(args, "--model"),
    baseURL: flagValue(args, "--base-url"),
    apiKeyEnv: flagValue(args, "--api-key-env"),
  };

  if (format === "probe") {
    const result = await probeAuthProfile(input, {
      live: args.includes("--live"),
      naiaAgentBin: flagValue(args, "--naia-agent-bin"),
      timeoutMs: numberFlagValue(args, "--timeout-ms"),
    });
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
  } else {
    const profile = resolveAuthProfile(input);
    if (format === "manifest") {
      console.log(JSON.stringify(buildNaiaServiceManifest(profile), null, 2));
    } else if (format === "env") {
      for (const line of formatShellEnvPlan(profile.envPlan)) {
        console.log(line);
      }
    } else if (format === "profile") {
      console.log(JSON.stringify({ ...profile, envPlan: redactEnvPlan(profile.envPlan) }, null, 2));
    } else {
      throw new Error("unknown --format");
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

function flagValue(values: string[], name: string): string | undefined {
  const index = values.indexOf(name);
  if (index === -1) return undefined;
  return values[index + 1];
}

function numberFlagValue(values: string[], name: string): number | undefined {
  const value = flagValue(values, name);
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`${name} must be a positive number`);
  return parsed;
}
