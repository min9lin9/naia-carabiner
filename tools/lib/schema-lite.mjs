export function validateSchema(value, schema, path = "$") {
  const failures = [];
  check(value, schema, path, failures);
  return failures;
}

function check(value, schema, path, failures) {
  if (!schema) return;

  if (schema.required && isObject(value)) {
    for (const key of schema.required) {
      if (!(key in value)) failures.push(`${path} missing required key: ${key}`);
    }
  }

  if (schema.type && !matchesType(value, schema.type)) {
    failures.push(`${path} expected ${schema.type}, got ${Array.isArray(value) ? "array" : typeof value}`);
    return;
  }

  if (schema.enum && !schema.enum.includes(value)) {
    failures.push(`${path} expected one of ${schema.enum.join(", ")}, got ${String(value)}`);
  }

  if (Object.hasOwn(schema, "const") && value !== schema.const) {
    failures.push(`${path} expected ${String(schema.const)}, got ${String(value)}`);
  }

  if (typeof value === "string" && schema.minLength && value.length < schema.minLength) {
    failures.push(`${path} must be at least ${schema.minLength} characters`);
  }

  if (typeof value === "number") {
    if (typeof schema.minimum === "number" && value < schema.minimum) failures.push(`${path} below minimum ${schema.minimum}`);
    if (typeof schema.maximum === "number" && value > schema.maximum) failures.push(`${path} above maximum ${schema.maximum}`);
  }

  if (Array.isArray(value) && schema.items) {
    value.forEach((item, index) => check(item, schema.items, `${path}[${index}]`, failures));
  }

  if (isObject(value) && schema.properties) {
    for (const [key, childSchema] of Object.entries(schema.properties)) {
      if (key in value) check(value[key], childSchema, `${path}.${key}`, failures);
    }
  }
}

function matchesType(value, type) {
  if (type === "array") return Array.isArray(value);
  if (type === "object") return isObject(value);
  if (type === "integer") return Number.isInteger(value);
  return typeof value === type;
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
