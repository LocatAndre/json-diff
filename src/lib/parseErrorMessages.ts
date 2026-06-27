import { m } from "@/paraglide/messages.js";
import type { ParseError } from "./jsonDiff";

export function getParseErrorMessage(error: ParseError): string {
  if (error.code === "empty_input") {
    return m.error_empty_input();
  }

  return error.detail ?? m.error_invalid_json();
}
