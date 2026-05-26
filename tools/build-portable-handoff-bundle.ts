#!/usr/bin/env node
// @ts-nocheck
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const defaultRunDir = "output/harness-runs/2026-05-20-harness-maker-bootstrap/harness-maker";

const args = process.argv.slice(2);
const runArg = args.find((arg) => !arg.startsWith("--")) || defaultRunDir;
const outArg = readOption(args, "--out");
const runDir = path.resolve(root, runArg);
const defaultBundleName = `${path.basename(path.dirname(runDir))}-${path.basename(runDir)}`;
const bundleDir = path.resolve(root, outArg || path.join("output/portable-handoff-bundles", defaultBundleName));
const requiredFilesPath = path.join(runDir, "handoff", "required-files.yaml");

const ignoredNames = new Set([".DS_Store", ".git", "node_modules"]);
const copied = [];
const missing = [];

assertDirectory(runDir, "run directory");
assertFile(requiredFilesPath, "handoff manifest");

copyDirectoryContents(runDir, bundleDir);

for (const entry of manifestEntries(fs.readFileSync(requiredFilesPath, "utf8"))) {
  const source = resolveManifestSource(entry.path);
  if (!source) {
    missing.push(entry);
    continue;
  }
  copyPath(source, path.join(bundleDir, entry.path));
}

copyPath(
  path.join(root, "tools", "build-portable-handoff-bundle.ts"),
  path.join(bundleDir, "tools", "build-portable-handoff-bundle.ts")
);

writeText(
  path.join(bundleDir, "START_HERE.md"),
  `# Start Here

Open \`handoff/startup-prompt.md\` first.

This directory is a portable handoff bundle. Treat this directory as \`HANDOFF_BUNDLE_ROOT\`.

Portable verification commands:

\`\`\`sh
node tools/validate-harness-run.ts .
node tools/harness-state-runner.ts .
node tools/evaluate-research-quality.ts .
node tools/pre-handoff-gate.ts .
\`\`\`
`
);

writeText(
  path.join(bundleDir, "bundle-manifest.json"),
  `${JSON.stringify(
    {
      status: missing.some((entry) => entry.required) ? "fail" : "pass",
      generated_at: new Date().toISOString(),
      source_run_dir: path.relative(root, runDir),
      bundle_dir: path.relative(root, bundleDir),
      copied_count: copied.length,
      missing
    },
    null,
    2
  )}\n`
);

const requiredMissing = missing.filter((entry) => entry.required);
console.log(
  JSON.stringify(
    {
      status: requiredMissing.length === 0 ? "pass" : "fail",
      bundle_dir: path.relative(root, bundleDir),
      copied_count: copied.length,
      missing_count: missing.length,
      required_missing_count: requiredMissing.length
    },
    null,
    2
  )
);

if (requiredMissing.length > 0) process.exit(1);

function readOption(values, name) {
  const inline = values.find((value) => value.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);

  const index = values.indexOf(name);
  if (index >= 0) return values[index + 1];
  return null;
}

function assertDirectory(targetPath, label) {
  if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) {
    throw new Error(`missing ${label}: ${targetPath}`);
  }
}

function assertFile(targetPath, label) {
  if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
    throw new Error(`missing ${label}: ${targetPath}`);
  }
}

function manifestEntries(yamlText) {
  const entries = [];
  let current = null;

  for (const line of yamlText.split(/\r?\n/)) {
    const pathMatch = line.match(/^\s*-\s+path:\s*(.+)$/);
    if (pathMatch) {
      if (current) entries.push(current);
      current = {
        path: stripQuotes(pathMatch[1].trim()),
        required: false
      };
      continue;
    }

    const requiredMatch = line.match(/^\s+required:\s*(true|false)\s*$/);
    if (requiredMatch && current) {
      current.required = requiredMatch[1] === "true";
    }
  }

  if (current) entries.push(current);
  return uniqueEntries(entries);
}

function stripQuotes(value) {
  return value.replace(/^["']|["']$/g, "");
}

function uniqueEntries(entries) {
  const seen = new Set();
  const unique = [];

  for (const entry of entries) {
    if (seen.has(entry.path)) continue;
    seen.add(entry.path);
    unique.push(entry);
  }

  return unique;
}

function resolveManifestSource(relativePath) {
  const candidates = [
    path.join(root, relativePath),
    path.join(runDir, relativePath)
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function copyDirectoryContents(sourceDir, destinationDir) {
  fs.mkdirSync(destinationDir, { recursive: true });
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (ignoredNames.has(entry.name)) continue;
    copyPath(path.join(sourceDir, entry.name), path.join(destinationDir, entry.name));
  }
}

function copyPath(source, destination) {
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
      if (ignoredNames.has(entry.name)) continue;
      copyPath(path.join(source, entry.name), path.join(destination, entry.name));
    }
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  copied.push(path.relative(bundleDir, destination));
}

function writeText(destination, content) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, content);
  copied.push(path.relative(bundleDir, destination));
}
