#!/usr/bin/env node
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const defaultRunDir = "output/harness-runs/2026-05-20-harness-maker-bootstrap/harness-maker";
const runDir = path.resolve(root, process.argv[2] || defaultRunDir);

const checks = buildChecks();

function buildChecks() {
  const relativeRunDir = path.relative(root, runDir);
  const validateCheck = relativeRunDir === defaultRunDir
    ? {
        name: "validate:current",
        command: "npm --silent run validate:current",
        executable: "npm",
        args: ["--silent", "run", "validate:current"]
      }
    : commandCheck("validate:run", "tools/validate-harness-run.mjs");

  return [
    validateCheck,
    commandCheck("state:runner", "tools/harness-state-runner.mjs"),
    commandCheck("research-quality", "tools/evaluate-research-quality.mjs")
  ];
}

function commandCheck(name, script) {
  return {
    name,
    command: `node ${script} ${path.relative(root, runDir)}`,
    executable: process.execPath,
    args: [path.join(root, script), runDir]
  };
}

function runCheck(check) {
  const result = spawnSync(check.executable, check.args, {
    cwd: root,
    encoding: "utf8"
  });

  return {
    name: check.name,
    command: check.command,
    status: result.status === 0 ? "pass" : "fail",
    exit_code: result.status,
    stdout: parseJson(result.stdout),
    stderr: result.stderr.trim()
  };
}

function parseJson(output) {
  try {
    return JSON.parse(output);
  } catch {
    return output.trim();
  }
}

function main() {
  const results = checks.map(runCheck);
  const failures = results
    .filter((result) => result.status !== "pass")
    .map((result) => `${result.name} failed with exit code ${result.exit_code}`);

  const report = {
    runDir,
    status: failures.length === 0 ? "pass" : "fail",
    failures,
    checks: results
  };

  console.log(JSON.stringify(report, null, 2));
  process.exit(failures.length === 0 ? 0 : 1);
}

main();
