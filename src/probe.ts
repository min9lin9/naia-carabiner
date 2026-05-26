import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  buildNaiaServiceManifest,
  resolveAuthProfile,
  type AuthProfile,
  type AuthProfileInput,
  type NaiaServiceManifest,
} from "./index.ts";

export type ProbeAuthMode = "env-ref" | "codex-login-or-api-key";
export type ProbeErrorCode =
  | "missing_env"
  | "missing_naia_agent_bin"
  | "naia_agent_failed"
  | "codex_sdk_unavailable"
  | "codex_live_failed"
  | "secret_printed";

export interface ProbeCheck {
  name: string;
  ok: boolean;
  skipped?: boolean;
  message?: string;
  secretPrinted?: boolean;
}

export interface ProbeOptions {
  env?: NodeJS.ProcessEnv;
  live?: boolean;
  naiaAgentBin?: string;
  timeoutMs?: number;
  prompt?: string;
}

export interface ProbeResult {
  ok: boolean;
  profile: AuthProfile["kind"];
  backend: AuthProfile["backend"];
  model: string;
  auth: ProbeAuthMode;
  checks: ProbeCheck[];
  durationMs: number;
  retryable: boolean;
  secretPrinted: boolean;
  errorCode?: ProbeErrorCode;
  manifest?: NaiaServiceManifest;
}

const DEFAULT_TIMEOUT_MS = 15_000;
const PROBE_PROMPT = "Reply with exactly NAIA_CARABINER_PROBE_OK.";

export async function probeAuthProfile(input: AuthProfileInput, options: ProbeOptions = {}): Promise<ProbeResult> {
  const startedAt = Date.now();
  const env = options.env ?? process.env;
  const profile = resolveAuthProfile(input);

  if (profile.backend === "codex-local-agent") {
    return probeCodexProfile(profile, options, startedAt);
  }

  return probeOpenAICompatibleProfile(profile, options, env, startedAt);
}

async function probeCodexProfile(profile: AuthProfile, options: ProbeOptions, startedAt: number): Promise<ProbeResult> {
  const checks: ProbeCheck[] = [];
  let errorCode: ProbeErrorCode | undefined;
  let retryable = false;

  const codexImport = await probeCodexSdkImport();
  checks.push(codexImport);
  if (!codexImport.ok) errorCode = "codex_sdk_unavailable";

  if (options.live && codexImport.ok) {
    const live = await runCodexLiveProbe(profile, options);
    checks.push(live);
    if (!live.ok) {
      errorCode = "codex_live_failed";
      retryable = true;
    }
  } else {
    checks.push({ name: "codex_live_probe", ok: true, skipped: true, message: "pass --live to run a Codex SDK smoke turn" });
  }

  return finishResultWithSecretFlag({
    profile,
    checks,
    startedAt,
    auth: "codex-login-or-api-key",
    retryable,
    errorCode,
  }, []);
}

async function probeOpenAICompatibleProfile(
  profile: AuthProfile,
  options: ProbeOptions,
  env: NodeJS.ProcessEnv,
  startedAt: number,
): Promise<ProbeResult> {
  const checks: ProbeCheck[] = [];
  const keyEnv = profile.apiKeyEnv;
  const keyValue = keyEnv ? env[keyEnv] : undefined;
  let errorCode: ProbeErrorCode | undefined = keyValue ? undefined : "missing_env";
  let retryable = false;

  checks.push(apiKeyPresenceCheck(keyEnv, Boolean(keyValue)));
  const manifest = buildNaiaServiceManifest(profile);
  checks.push({ name: "manifest_build", ok: true, message: manifest.name });
  checks.push({ name: "allowlist_host", ok: profile.allowlistHosts.length > 0, message: profile.allowlistHosts.join(",") });

  const live = await maybeRunNaiaAgentLiveProbe({ profile, manifest, env, options, keyValue });
  checks.push(live.check);
  errorCode = live.errorCode ?? errorCode;
  retryable = live.retryable ?? retryable;

  return finishResultWithSecretFlag({
    profile,
    checks,
    startedAt,
    auth: "env-ref",
    retryable,
    errorCode,
    manifest,
  }, keyValue ? [keyValue] : []);
}

function apiKeyPresenceCheck(keyEnv: string | undefined, hasKey: boolean): ProbeCheck {
  return {
    name: "api_key_env_present",
    ok: hasKey,
    message: keyEnv ? `${keyEnv} ${hasKey ? "is set" : "is not set"}` : "profile has no apiKeyEnv",
  };
}

async function maybeRunNaiaAgentLiveProbe(input: {
  profile: AuthProfile;
  manifest: NaiaServiceManifest;
  env: NodeJS.ProcessEnv;
  options: ProbeOptions;
  keyValue?: string;
}): Promise<{ check: ProbeCheck; errorCode?: ProbeErrorCode; retryable?: boolean }> {
  if (!input.options.live) {
    return {
      check: {
        name: "naia_agent_live_probe",
        ok: true,
        skipped: true,
        message: "pass --live and NAIA_AGENT_BIN to run naia-agent smoke",
      },
    };
  }

  const bin = input.options.naiaAgentBin ?? input.env.NAIA_AGENT_BIN;
  if (!bin) {
    return {
      check: { name: "naia_agent_live_probe", ok: false, message: "NAIA_AGENT_BIN is required for --live" },
      errorCode: "missing_naia_agent_bin",
    };
  }

  if (!input.keyValue) {
    return { check: { name: "naia_agent_live_probe", ok: true, skipped: true, message: "API key env is required before live smoke" } };
  }

  const check = await runNaiaAgentLiveProbe({
    bin,
    manifest: input.manifest,
    env: input.env,
    profile: input.profile,
    timeoutMs: input.options.timeoutMs,
    prompt: input.options.prompt,
    secrets: [input.keyValue],
  });
  if (check.ok) return { check };
  if (check.secretPrinted) return { check, errorCode: "secret_printed" };
  return { check, errorCode: "naia_agent_failed", retryable: true };
}

function finishResultWithSecretFlag(
  input: Parameters<typeof finishResult>[0],
  secrets: string[],
): ProbeResult {
  const result = finishResult(input);
  return {
    ...result,
    secretPrinted: containsAnySecret(result, secrets) || input.checks.some((check) => check.secretPrinted),
  };
}
function finishResult(input: {
  profile: AuthProfile;
  checks: ProbeCheck[];
  startedAt: number;
  auth: ProbeAuthMode;
  retryable: boolean;
  errorCode?: ProbeErrorCode;
  manifest?: NaiaServiceManifest;
}): Omit<ProbeResult, "secretPrinted"> {
  return {
    ok: input.checks.every((check) => check.ok),
    profile: input.profile.kind,
    backend: input.profile.backend,
    model: input.profile.model,
    auth: input.auth,
    checks: input.checks,
    durationMs: Date.now() - input.startedAt,
    retryable: input.retryable,
    ...(input.errorCode ? { errorCode: input.errorCode } : {}),
    ...(input.manifest ? { manifest: input.manifest } : {}),
  };
}

async function probeCodexSdkImport(): Promise<ProbeCheck> {
  try {
    await import("@openai/codex-sdk");
    return { name: "codex_sdk_import", ok: true, message: "@openai/codex-sdk is importable" };
  } catch {
    return { name: "codex_sdk_import", ok: false, message: "@openai/codex-sdk is not installed or cannot be imported" };
  }
}

async function runCodexLiveProbe(profile: AuthProfile, options: ProbeOptions): Promise<ProbeCheck> {
  try {
    const { Codex } = await import("@openai/codex-sdk");
    const codex = new Codex();
    const thread = codex.startThread({
      model: profile.model,
      sandboxMode: "read-only",
      approvalPolicy: "never",
      workingDirectory: process.cwd(),
    });
    const turn = await withTimeout(
      thread.run(options.prompt ?? PROBE_PROMPT),
      options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      "Codex SDK live probe timed out",
    );
    const text = JSON.stringify(turn.items ?? []);
    return {
      name: "codex_live_probe",
      ok: text.includes("NAIA_CARABINER_PROBE_OK"),
      message: text.includes("NAIA_CARABINER_PROBE_OK")
        ? "Codex SDK smoke turn completed"
        : "Codex SDK smoke turn did not return expected marker",
    };
  } catch (error) {
    return { name: "codex_live_probe", ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

async function runNaiaAgentLiveProbe(input: {
  bin: string;
  manifest: NaiaServiceManifest;
  env: NodeJS.ProcessEnv;
  profile: AuthProfile;
  timeoutMs?: number;
  prompt?: string;
  secrets: string[];
}): Promise<ProbeCheck> {
  const dir = await mkdtemp(join(tmpdir(), "naia-carabiner-probe-"));
  const manifestPath = join(dir, "service.json");
  try {
    await writeFile(manifestPath, JSON.stringify(input.manifest, null, 2));
    const output = await runCommand(input.bin, ["--service", manifestPath, input.prompt ?? PROBE_PROMPT], {
      env: {
        ...process.env,
        ...input.env,
        ...materializeEnvPlan(input.profile.envPlan, input.env),
      },
      timeoutMs: input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    });
    const combinedOutput = `${output.stdout}\n${output.stderr}`;
    const completed = output.exitCode === 0 && combinedOutput.includes("NAIA_CARABINER_PROBE_OK");
    const secretPrinted = containsAnySecret(combinedOutput, input.secrets);
    return {
      name: "naia_agent_live_probe",
      ok: completed && !secretPrinted,
      message: secretPrinted
        ? "naia-agent output contained secret material"
        : output.exitCode === 0 ? "naia-agent process completed" : `naia-agent exited ${output.exitCode}`,
      secretPrinted,
    };
  } catch (error) {
    return { name: "naia_agent_live_probe", ok: false, message: error instanceof Error ? error.message : String(error) };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function runCommand(
  command: string,
  args: string[],
  options: { env: NodeJS.ProcessEnv; timeoutMs: number },
): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env: options.env, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("naia-agent live probe timed out"));
    }, options.timeoutMs);
    child.stdout.on("data", (chunk: Buffer) => { stdout += chunk.toString("utf8"); });
    child.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString("utf8"); });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (exitCode) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode });
    });
  });
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function materializeEnvPlan(envPlan: Record<string, string>, env: NodeJS.ProcessEnv): Record<string, string> {
  return Object.fromEntries(Object.entries(envPlan).map(([key, value]) => {
    const envRef = value.match(/^\$([A-Z_][A-Z0-9_]*)$/);
    if (!envRef) return [key, value];
    return [key, env[envRef[1]] ?? ""];
  }));
}

function containsAnySecret(result: unknown, secrets: string[]): boolean {
  const serialized = JSON.stringify(result);
  return secrets.some((secret) => secret.length > 0 && serialized.includes(secret));
}
