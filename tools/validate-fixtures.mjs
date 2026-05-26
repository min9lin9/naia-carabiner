#!/usr/bin/env node
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const root = process.cwd();

const fixtures = [
  {
    id: "valid-local",
    path: "fixtures/harness-runs/valid-local/harness-maker",
    expected: "pass"
  },
  {
    id: "invalid-missing-field",
    path: "fixtures/harness-runs/invalid-missing-field/harness-maker",
    expected: "fail"
  },
  {
    id: "invalid-compound-active",
    path: "fixtures/harness-runs/invalid-compound-active/harness-maker",
    expected: "fail"
  }
];

function runFixture(fixture) {
  const result = spawnSync(process.execPath, [
    path.join(root, "tools/validate-harness-run.mjs"),
    fixture.path
  ], {
    cwd: root,
    encoding: "utf8"
  });

  const actual = result.status === 0 ? "pass" : "fail";
  return {
    id: fixture.id,
    fixture_path: fixture.path,
    expected: fixture.expected,
    actual,
    status: actual === fixture.expected ? "pass" : "fail",
    validator_exit_code: result.status,
    validator_result: parseJson(result.stdout),
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
  const results = fixtures.map(runFixture);
  const failures = results
    .filter((result) => result.status !== "pass")
    .map((result) => `${result.id} expected ${result.expected}, got ${result.actual}`);

  const report = {
    status: failures.length === 0 ? "pass" : "fail",
    failures,
    results
  };

  console.log(JSON.stringify(report, null, 2));
  process.exit(failures.length === 0 ? 0 : 1);
}

main();
