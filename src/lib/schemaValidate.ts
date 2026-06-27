import Ajv, { type ErrorObject } from "ajv";
import { parseJson } from "./jsonDiff";

export interface SchemaValidationError {
  path: string;
  message: string;
}

const ajv = new Ajv({ allErrors: true, strict: false });

export function parseSchema(
  input: string,
): { ok: true; schema: object } | { ok: false; error: string } {
  const parsed = parseJson(input);
  if (!parsed.ok) {
    return {
      ok: false,
      error: parsed.code === "empty_input" ? "empty" : (parsed.detail ?? "invalid"),
    };
  }

  if (
    typeof parsed.value !== "object" ||
    parsed.value === null ||
    Array.isArray(parsed.value)
  ) {
    return { ok: false, error: "Schema must be an object" };
  }

  return { ok: true, schema: parsed.value as object };
}

export function validateAgainstSchema(
  value: unknown,
  schema: object,
): { valid: true } | { valid: false; errors: SchemaValidationError[] } {
  try {
    const validate = ajv.compile(schema);
    const valid = validate(value);

    if (valid) {
      return { valid: true };
    }

    const errors = (validate.errors ?? []).map(formatAjvError);
    return { valid: false, errors };
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          path: "$",
          message: error instanceof Error ? error.message : "Invalid schema",
        },
      ],
    };
  }
}

function formatAjvError(error: ErrorObject): SchemaValidationError {
  const path = error.instancePath ? `$${error.instancePath.replace(/\//g, ".")}` : "$";
  const message = error.message ?? "Validation error";
  return { path, message };
}
