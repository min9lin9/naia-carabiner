#!/usr/bin/env node
// @ts-nocheck
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parseYamlFile } from "./lib/yaml-lite.ts";
import { buildStateReport, allowedStageStatuses } from "./lib/harness-state.ts";

const root = process.cwd();
const defaultRunDir = "output/harness-runs/2026-05-20-harness-maker-bootstrap/harness-maker";
const runDir = path.resolve(root, process.argv[2] || defaultRunDir);
const failures = [];

function exists(relativePath) {
  return fs.existsSync(path.join(runDir, relativePath));
}

function read(relativePath) {
  const fullPath = path.join(runDir, relativePath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : "";
}

function fail(message) {
  failures.push(message);
}

function loadClassification() {
  const file = path.join(runDir, "classification.yaml");
  if (!fs.existsSync(file)) {
    fail("classification.yaml missing");
    return {};
  }
  try {
    return parseYamlFile(file);
  } catch (error) {
    fail(`classification.yaml YAML parse failed: ${error.message}`);
    return {};
  }
}

function main() {
  if (!fs.existsSync(runDir)) fail(`run directory does not exist: ${runDir}`);

  const classification = fs.existsSync(runDir) ? loadClassification() : {};
  const stages = buildStateReport({ classification, exists, read });

  for (const stage of stages) {
    if (!allowedStageStatuses.includes(stage.status)) {
      fail(`${stage.name} has invalid state status: ${stage.status}`);
    }
    if (stage.status === "revise" || stage.status === "blocked") {
      fail(`${stage.name} is ${stage.status}`);
    }
  }

  const result = {
    runDir,
    status: failures.length === 0 ? "pass" : "fail",
    failures,
    stages
  };

  console.log(JSON.stringify(result, null, 2));
  process.exit(failures.length === 0 ? 0 : 1);
}

main();
