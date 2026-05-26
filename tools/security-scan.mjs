#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.argv[2] ?? ".";
const ignoredDirectories = new Set([".git", ".code-review-graph", "node_modules", "dist", "coverage", ".next"]);
const ignoredFiles = new Set(["package-lock.json"]);
const issues = [];

const checks = [
  {
    name: "machine-local absolute path",
    pattern: /\/(?:Users|home)\/burt\b/g,
    message: "replace user-specific paths with a source handle or documented env placeholder",
  },
  {
    name: "legacy Kimi env name",
    pattern: new RegExp("MOONSHOT" + "_API_KEY", "g"),
    message: "Kimi Code profiles must use KIMI_API_KEY",
  },
  {
    name: "embedded URL credentials",
    pattern: /https?:\/\/[^\/\s:@]+:[^\/\s@]+@/g,
    message: "provider URLs must not embed credentials",
  },
  {
    name: "raw API key material",
    pattern: /(?:sk-proj|sk|moonshot)-[A-Za-z0-9_-]{20,}/gi,
    message: "commit only environment variable references, never raw keys",
  },
];

for (const file of walk(root)) {
  const relativePath = relative(root, file) || file;
  if (ignoredFiles.has(relativePath)) continue;

  const buffer = readFileSync(file);
  if (buffer.includes(0)) continue;

  const content = buffer.toString("utf8");
  for (const check of checks) {
    for (const match of content.matchAll(check.pattern)) {
      if (isAllowedFixture(relativePath, check.name)) continue;
      issues.push({
        file: relativePath,
        line: lineNumber(content, match.index ?? 0),
        name: check.name,
        message: check.message,
      });
    }
  }

  if (relativePath === "package.json" && /:\s*"latest"/.test(content)) {
    issues.push({
      file: relativePath,
      line: lineNumber(content, content.indexOf("latest")),
      name: "floating dependency",
      message: "pin dependencies for reproducible contributor installs",
    });
  }
}

if (issues.length > 0) {
  for (const issue of issues) {
    console.error(`${issue.file}:${issue.line} ${issue.name}: ${issue.message}`);
  }
  process.exit(1);
}

console.log("security scan passed");

function* walk(directory) {
  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) continue;

    const path = join(directory, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      yield* walk(path);
    } else if (stat.isFile()) {
      yield path;
    }
  }
}

function isAllowedFixture(relativePath, checkName) {
  return checkName === "embedded URL credentials" && relativePath.startsWith("tests/");
}

function lineNumber(content, index) {
  return content.slice(0, index).split("\n").length;
}
