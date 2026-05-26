// @ts-nocheck
import fs from "node:fs";

export function parseYamlFile(filePath) {
  return parseYaml(fs.readFileSync(filePath, "utf8"));
}

export function parseYaml(source) {
  const lines = source
    .replace(/\t/g, "  ")
    .split(/\r?\n/)
    .map((raw) => ({ raw, indent: raw.match(/^ */)[0].length, text: stripComment(raw).trim() }))
    .filter((line) => line.text.length > 0);

  const [value] = parseBlock(lines, 0, 0);
  return value ?? {};
}

function parseBlock(lines, index, indent) {
  if (index >= lines.length) return [{}, index];

  const isArray = lines[index].indent === indent && lines[index].text.startsWith("- ");
  return isArray ? parseArray(lines, index, indent) : parseObject(lines, index, indent);
}

function parseObject(lines, index, indent) {
  const object = {};

  while (index < lines.length) {
    const line = lines[index];
    if (line.indent < indent) break;
    if (line.indent > indent) {
      index += 1;
      continue;
    }
    if (line.text.startsWith("- ")) break;

    const splitAt = line.text.indexOf(":");
    if (splitAt === -1) {
      index += 1;
      continue;
    }

    const key = line.text.slice(0, splitAt).trim();
    const rest = line.text.slice(splitAt + 1).trim();

    if (rest.length > 0) {
      object[key] = parseScalar(rest);
      index += 1;
      continue;
    }

    const next = lines[index + 1];
    if (!next || next.indent <= indent) {
      object[key] = null;
      index += 1;
      continue;
    }

    const [child, nextIndex] = parseBlock(lines, index + 1, next.indent);
    object[key] = child;
    index = nextIndex;
  }

  return [object, index];
}

function parseArray(lines, index, indent) {
  const array = [];

  while (index < lines.length) {
    const line = lines[index];
    if (line.indent < indent) break;
    if (line.indent !== indent || !line.text.startsWith("- ")) break;

    const rest = line.text.slice(2).trim();
    if (rest.length === 0) {
      const next = lines[index + 1];
      if (!next || next.indent <= indent) {
        array.push(null);
        index += 1;
      } else {
        const [child, nextIndex] = parseBlock(lines, index + 1, next.indent);
        array.push(child);
        index = nextIndex;
      }
      continue;
    }

    if (rest.includes(":")) {
      const [firstKey, firstValue] = splitKeyValue(rest);
      const item = { [firstKey]: parseScalar(firstValue) };
      index += 1;

      while (index < lines.length && lines[index].indent > indent) {
        const childLine = lines[index];
        if (childLine.text.startsWith("- ")) {
          break;
        }
        const splitAt = childLine.text.indexOf(":");
        if (splitAt === -1) {
          index += 1;
          continue;
        }

        const key = childLine.text.slice(0, splitAt).trim();
        const value = childLine.text.slice(splitAt + 1).trim();
        if (value.length > 0) {
          item[key] = parseScalar(value);
          index += 1;
          continue;
        }

        const next = lines[index + 1];
        if (!next || next.indent <= childLine.indent) {
          item[key] = null;
          index += 1;
          continue;
        }
        const [child, nextIndex] = parseBlock(lines, index + 1, next.indent);
        item[key] = child;
        index = nextIndex;
      }

      array.push(item);
      continue;
    }

    array.push(parseScalar(rest));
    index += 1;
  }

  return [array, index];
}

function splitKeyValue(text) {
  const splitAt = text.indexOf(":");
  return [text.slice(0, splitAt).trim(), text.slice(splitAt + 1).trim()];
}

function parseScalar(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^-?\d+$/.test(value)) return Number(value);
  if (/^-?\d+\.\d+$/.test(value)) return Number(value);
  if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  if (value === "[]") return [];
  if (value === "{}") return {};
  return value;
}

function stripComment(raw) {
  let quote = null;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if ((char === "\"" || char === "'") && raw[index - 1] !== "\\") {
      quote = quote === char ? null : quote ?? char;
    }
    if (char === "#" && quote === null) {
      return raw.slice(0, index);
    }
  }
  return raw;
}
