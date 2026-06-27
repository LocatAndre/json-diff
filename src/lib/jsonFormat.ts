export type FormatMode =
  | "none"
  | "sorted-keys"
  | "pretty-2"
  | "pretty-4"
  | "compact"
  | "sorted-pretty-2"
  | "sorted-pretty-4"
  | "sorted-compact";

export const FORMAT_MODES: FormatMode[] = [
  "none",
  "sorted-keys",
  "pretty-2",
  "pretty-4",
  "compact",
  "sorted-pretty-2",
  "sorted-pretty-4",
  "sorted-compact",
];

function shouldSortKeys(mode: FormatMode): boolean {
  return mode.startsWith("sorted");
}

function getIndent(mode: FormatMode): number | null {
  if (mode === "compact" || mode === "sorted-compact" || mode === "sorted-keys") {
    return null;
  }
  if (mode === "pretty-4" || mode === "sorted-pretty-4") {
    return 4;
  }
  return 2;
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }

  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return Object.keys(record)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeysDeep(record[key]);
        return acc;
      }, {});
  }

  return value;
}

export function normalizeForCompare(value: unknown, mode: FormatMode): unknown {
  const normalized = shouldSortKeys(mode) ? sortKeysDeep(value) : value;
  return JSON.parse(JSON.stringify(normalized));
}

export function formatToString(value: unknown, mode: FormatMode): string {
  const normalized = normalizeForCompare(value, mode);
  const indent = getIndent(mode);

  if (indent === null) {
    return JSON.stringify(normalized);
  }

  return JSON.stringify(normalized, null, indent);
}
