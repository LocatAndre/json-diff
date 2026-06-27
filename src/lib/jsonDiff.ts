export type DiffType = "added" | "removed" | "changed" | "unchanged";
export type ArrayCompareMode = "by-index" | "by-value" | "by-key";
export type MatchBy = "index" | "key" | "value";

export interface DiffEntry {
  path: string;
  type: DiffType;
  left?: unknown;
  right?: unknown;
  arrayIndexLeft?: number;
  arrayIndexRight?: number;
  matchedBy?: MatchBy;
}

export interface DiffOptions {
  arrayMode?: ArrayCompareMode;
  arrayKey?: string;
  treatNullAsMissing?: boolean;
  numericTolerance?: boolean;
  maxDepth?: number;
}

export interface ParseResult {
  ok: true;
  value: unknown;
}

export interface ParseError {
  ok: false;
  code: "empty_input" | "invalid_json";
  detail?: string;
}

const DEFAULT_OPTIONS: Required<
  Pick<DiffOptions, "arrayMode" | "treatNullAsMissing" | "numericTolerance">
> & { arrayKey?: string; maxDepth?: number } = {
  arrayMode: "by-index",
  treatNullAsMissing: false,
  numericTolerance: false,
  arrayKey: undefined,
  maxDepth: undefined,
};

export function parseJson(input: string): ParseResult | ParseError {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, code: "empty_input" };
  }

  try {
    return { ok: true, value: JSON.parse(trimmed) };
  } catch (error) {
    const detail = error instanceof Error ? error.message : undefined;
    return { ok: false, code: "invalid_json", detail };
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function formatPath(segments: string[]): string {
  if (segments.length === 0) return "$";
  return segments.reduce<string>((path, segment) => {
    if (/^\d+$/.test(segment)) {
      return `${path}[${segment}]`;
    }
    if (/^[a-zA-Z_$][\w$]*$/.test(segment)) {
      return path ? `${path}.${segment}` : segment;
    }
    return `${path}["${segment.replace(/"/g, '\\"')}"]`;
  }, "");
}

export function pathToJsonPointer(segments: string[]): string {
  if (segments.length === 0) return "";
  return segments
    .map((segment) => `/${segment.replace(/~/g, "~0").replace(/\//g, "~1")}`)
    .join("");
}

function normalizeValue(value: unknown, options: DiffOptions): unknown {
  if (options.treatNullAsMissing && value === null) {
    return undefined;
  }
  return value;
}

function valuesEqual(left: unknown, right: unknown, options: DiffOptions): boolean {
  const l = normalizeValue(left, options);
  const r = normalizeValue(right, options);

  if (l === undefined && r === undefined) {
    return true;
  }

  if (options.numericTolerance && typeof l === "number" && typeof r === "number") {
    return l === r;
  }

  return Object.is(l, r);
}

function detectArrayKey(items: unknown[]): string | undefined {
  if (items.length === 0) {
    return undefined;
  }

  const objectItems = items.filter(isObject);
  if (objectItems.length !== items.length) {
    return undefined;
  }

  const candidateKeys = ["id", "_id", "uuid", "key", "@id"];
  for (const key of candidateKeys) {
    const values = objectItems.map((item) => item[key]);
    if (
      values.every((v) => v !== undefined && v !== null) &&
      new Set(values).size === values.length
    ) {
      return key;
    }
  }

  const firstItem = objectItems[0];
  if (!firstItem) {
    return undefined;
  }

  const firstKeys = Object.keys(firstItem);
  for (const key of firstKeys) {
    const values = objectItems.map((item) => item[key]);
    if (
      values.every((v) => v !== undefined && v !== null) &&
      new Set(values.map(String)).size === values.length
    ) {
      return key;
    }
  }

  return undefined;
}

function compareArraysByIndex(
  left: unknown[],
  right: unknown[],
  path: string[],
  entries: DiffEntry[],
  options: DiffOptions,
  depth: number,
): void {
  const maxLength = Math.max(left.length, right.length);
  for (let index = 0; index < maxLength; index += 1) {
    compareValues(
      left[index],
      right[index],
      [...path, String(index)],
      entries,
      options,
      depth + 1,
      "index",
    );
  }
}

function compareArraysByValue(
  left: unknown[],
  right: unknown[],
  path: string[],
  entries: DiffEntry[],
  options: DiffOptions,
  depth: number,
): void {
  const leftUsed = new Set<number>();
  const rightUsed = new Set<number>();

  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    let matched = false;
    for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
      if (rightUsed.has(rightIndex)) continue;
      if (valuesEqual(left[leftIndex], right[rightIndex], options)) {
        leftUsed.add(leftIndex);
        rightUsed.add(rightIndex);
        compareValues(
          left[leftIndex],
          right[rightIndex],
          [...path, String(leftIndex)],
          entries,
          options,
          depth + 1,
          "value",
        );
        matched = true;
        break;
      }
    }
    if (!matched) {
      entries.push({
        path: formatPath([...path, String(leftIndex)]),
        type: "removed",
        left: left[leftIndex],
        arrayIndexLeft: leftIndex,
        matchedBy: "value",
      });
    }
  }

  for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
    if (!rightUsed.has(rightIndex)) {
      entries.push({
        path: formatPath([...path, String(rightIndex)]),
        type: "added",
        right: right[rightIndex],
        arrayIndexRight: rightIndex,
        matchedBy: "value",
      });
    }
  }
}

function compareArraysByKey(
  left: unknown[],
  right: unknown[],
  path: string[],
  entries: DiffEntry[],
  options: DiffOptions,
  depth: number,
  keyField: string,
): void {
  const leftMap = new Map<string, { index: number; value: unknown }>();
  const rightMap = new Map<string, { index: number; value: unknown }>();

  for (let index = 0; index < left.length; index += 1) {
    const item = left[index];
    if (isObject(item) && item[keyField] !== undefined) {
      leftMap.set(String(item[keyField]), { index, value: item });
    } else {
      entries.push({
        path: formatPath([...path, String(index)]),
        type: "removed",
        left: item,
        arrayIndexLeft: index,
        matchedBy: "key",
      });
    }
  }

  for (let index = 0; index < right.length; index += 1) {
    const item = right[index];
    if (isObject(item) && item[keyField] !== undefined) {
      rightMap.set(String(item[keyField]), { index, value: item });
    } else {
      entries.push({
        path: formatPath([...path, String(index)]),
        type: "added",
        right: item,
        arrayIndexRight: index,
        matchedBy: "key",
      });
    }
  }

  const allKeys = new Set([...leftMap.keys(), ...rightMap.keys()]);
  for (const key of [...allKeys].sort()) {
    const leftEntry = leftMap.get(key);
    const rightEntry = rightMap.get(key);

    if (leftEntry && rightEntry) {
      compareValues(
        leftEntry.value,
        rightEntry.value,
        [...path, key],
        entries,
        options,
        depth + 1,
        "key",
      );
    } else if (leftEntry) {
      entries.push({
        path: formatPath([...path, key]),
        type: "removed",
        left: leftEntry.value,
        arrayIndexLeft: leftEntry.index,
        matchedBy: "key",
      });
    } else if (rightEntry) {
      entries.push({
        path: formatPath([...path, key]),
        type: "added",
        right: rightEntry.value,
        arrayIndexRight: rightEntry.index,
        matchedBy: "key",
      });
    }
  }
}

function compareArrays(
  left: unknown[],
  right: unknown[],
  path: string[],
  entries: DiffEntry[],
  options: DiffOptions,
  depth: number,
): void {
  const arrayMode = options.arrayMode ?? DEFAULT_OPTIONS.arrayMode;

  if (arrayMode === "by-value") {
    const allPrimitive =
      left.every((v) => v === null || typeof v !== "object") &&
      right.every((v) => v === null || typeof v !== "object");
    if (allPrimitive) {
      compareArraysByValue(left, right, path, entries, options, depth);
      return;
    }
  }

  if (arrayMode === "by-key") {
    const keyField = options.arrayKey ?? detectArrayKey([...left, ...right]);
    if (keyField) {
      compareArraysByKey(left, right, path, entries, options, depth, keyField);
      return;
    }
  }

  compareArraysByIndex(left, right, path, entries, options, depth);
}

function compareValues(
  left: unknown,
  right: unknown,
  path: string[],
  entries: DiffEntry[],
  options: DiffOptions,
  depth: number,
  matchedBy?: MatchBy,
): void {
  if (options.maxDepth !== undefined && depth > options.maxDepth) {
    if (!valuesEqual(left, right, options)) {
      entries.push({
        path: formatPath(path),
        type: "changed",
        left,
        right,
        matchedBy,
      });
    }
    return;
  }

  const normalizedLeft = normalizeValue(left, options);
  const normalizedRight = normalizeValue(right, options);

  if (valuesEqual(normalizedLeft, normalizedRight, options)) {
    if (left !== undefined || right !== undefined) {
      entries.push({
        path: formatPath(path),
        type: "unchanged",
        left,
        right,
        matchedBy,
      });
    }
    return;
  }

  if (normalizedLeft === undefined && normalizedRight !== undefined) {
    entries.push({ path: formatPath(path), type: "added", right, matchedBy });
    return;
  }

  if (normalizedLeft !== undefined && normalizedRight === undefined) {
    entries.push({ path: formatPath(path), type: "removed", left, matchedBy });
    return;
  }

  const leftIsArray = Array.isArray(left);
  const rightIsArray = Array.isArray(right);

  if (leftIsArray && rightIsArray) {
    compareArrays(left, right, path, entries, options, depth);
    return;
  }

  if (isObject(left) && isObject(right)) {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
    for (const key of [...keys].sort()) {
      compareValues(
        left[key],
        right[key],
        [...path, key],
        entries,
        options,
        depth + 1,
        matchedBy,
      );
    }
    return;
  }

  entries.push({
    path: formatPath(path),
    type: "changed",
    left,
    right,
    matchedBy,
  });
}

export function diffJson(
  left: unknown,
  right: unknown,
  options: DiffOptions = {},
): DiffEntry[] {
  const entries: DiffEntry[] = [];
  compareValues(left, right, [], entries, options, 0);
  return entries;
}

export function formatValue(value: unknown): string {
  if (value === undefined) return "undefined";
  return JSON.stringify(value, null, 2);
}

export function countChanges(entries: DiffEntry[]) {
  return entries.reduce(
    (counts, entry) => {
      if (entry.type === "added") counts.added += 1;
      if (entry.type === "removed") counts.removed += 1;
      if (entry.type === "changed") counts.changed += 1;
      return counts;
    },
    { added: 0, removed: 0, changed: 0 },
  );
}

export function filterDiffEntries(entries: DiffEntry[], query: string): DiffEntry[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return entries;
  }

  return entries.filter((entry) => {
    const pathMatch = entry.path.toLowerCase().includes(trimmed);
    const leftMatch =
      entry.left !== undefined &&
      formatValue(entry.left).toLowerCase().includes(trimmed);
    const rightMatch =
      entry.right !== undefined &&
      formatValue(entry.right).toLowerCase().includes(trimmed);
    return pathMatch || leftMatch || rightMatch;
  });
}

export function detectArrayKeyForValues(
  left: unknown,
  right: unknown,
): string | undefined {
  const items: unknown[] = [];
  if (Array.isArray(left)) items.push(...left);
  if (Array.isArray(right)) items.push(...right);
  return detectArrayKey(items);
}

export const SAMPLE_LEFT = `{"settings":{"notifications":true,"theme":"dark"},"roles":["user","editor"],"age":30,"name":"Mario Rossi"}`;

export const SAMPLE_RIGHT = `{
  "name": "Mario Rossi",
  "age": 31,
  "roles": ["user", "admin"],
  "settings": {
    "theme": "light",
    "notifications": true
  },
  "lastLogin": "2026-06-26"
}`;
