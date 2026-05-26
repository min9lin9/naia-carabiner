#!/usr/bin/env bun
import {
  buildNaiaServiceManifest,
  formatShellEnvPlan,
  redactEnvPlan,
  resolveAuthProfile,
  type AuthProfileKind,
} from "./index.ts";
import { probeAuthProfile } from "./probe.ts";

interface CliOptions {
  kind: AuthProfileKind;
  format: string;
  model?: string;
  baseURL?: string;
  apiKeyEnv?: string;
  live: boolean;
  naiaAgentBin?: string;
  timeoutMs?: number;
}

try {
  const options = parseCliArgs(process.argv.slice(2));
  const input = {
    kind: options.kind,
    model: options.model,
    baseURL: options.baseURL,
    apiKeyEnv: options.apiKeyEnv,
  };

  if (options.format === "probe") {
    const result = await probeAuthProfile(input, {
      live: options.live,
      naiaAgentBin: options.naiaAgentBin,
      timeoutMs: options.timeoutMs,
    });
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
  } else {
    const profile = resolveAuthProfile(input);
    if (options.format === "manifest") {
      console.log(JSON.stringify(buildNaiaServiceManifest(profile), null, 2));
    } else if (options.format === "env") {
      for (const line of formatShellEnvPlan(profile.envPlan)) {
        console.log(line);
      }
    } else if (options.format === "profile") {
      console.log(JSON.stringify({ ...profile, envPlan: redactEnvPlan(profile.envPlan) }, null, 2));
    } else {
      throw new Error("unknown --format");
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

function parseCliArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    kind: "kimi-api-key",
    format: "profile",
    live: false,
  };
  let sawKind = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--live") {
      options.live = true;
      continue;
    }

    if (arg.startsWith("--")) {
      const value = requiredFlagValue(args, index, arg);
      index += 1;
      if (arg === "--format") options.format = value;
      else if (arg === "--model") options.model = value;
      else if (arg === "--base-url") options.baseURL = value;
      else if (arg === "--api-key-env") options.apiKeyEnv = value;
      else if (arg === "--naia-agent-bin") options.naiaAgentBin = value;
      else if (arg === "--timeout-ms") options.timeoutMs = parsePositiveNumber(value, arg);
      else throw new Error(`unknown flag ${arg}`);
      continue;
    }

    if (sawKind) throw new Error(`unexpected positional argument: ${arg}`);
    options.kind = arg as AuthProfileKind;
    sawKind = true;
  }

  return options;
}

function requiredFlagValue(values: string[], index: number, name: string): string {
  const value = values[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a value`);
  return value;
}

function parsePositiveNumber(value: string, name: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`${name} must be a positive number`);
  return parsed;
}
