import type { ArrayCompareMode, DiffOptions } from "./jsonDiff";
import type { FormatMode } from "./jsonFormat";

export const STORAGE_KEYS = {
  left: "json-diff-left",
  right: "json-diff-right",
  formatMode: "json-diff-format-mode",
  displayMode: "json-diff-display-mode",
  viewMode: "json-diff-view-mode",
  arrayMode: "json-diff-array-mode",
  arrayKey: "json-diff-array-key",
  diffOptions: "json-diff-diff-options",
  schema: "json-diff-schema",
} as const;

export type DisplayMode = "path" | "split" | "unified";
export type ViewMode = "all" | "changes";

export interface PersistedDiffOptions
  extends Pick<DiffOptions, "treatNullAsMissing" | "numericTolerance" | "maxDepth"> {}

export const DEFAULT_DIFF_OPTIONS: PersistedDiffOptions = {
  treatNullAsMissing: false,
  numericTolerance: false,
  maxDepth: undefined,
};

export function clearSessionStorage(): void {
  for (const key of Object.values(STORAGE_KEYS)) {
    localStorage.removeItem(key);
  }
}

export function isValidFormatMode(value: string): value is FormatMode {
  return [
    "none",
    "sorted-keys",
    "pretty-2",
    "pretty-4",
    "compact",
    "sorted-pretty-2",
    "sorted-pretty-4",
    "sorted-compact",
  ].includes(value);
}

export function isValidArrayMode(value: string): value is ArrayCompareMode {
  return ["by-index", "by-value", "by-key"].includes(value);
}

export function isValidDisplayMode(value: string): value is DisplayMode {
  return ["path", "split", "unified"].includes(value);
}

export function isValidViewMode(value: string): value is ViewMode {
  return value === "all" || value === "changes";
}
