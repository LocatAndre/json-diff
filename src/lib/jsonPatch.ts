import { type DiffOptions, pathToJsonPointer } from "./jsonDiff";

export interface JsonPatchOperation {
  op: "add" | "remove" | "replace";
  path: string;
  value?: unknown;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function generatePatchRecursive(
  left: unknown,
  right: unknown,
  segments: string[],
  operations: JsonPatchOperation[],
  options: DiffOptions,
  depth: number,
): void {
  if (options.maxDepth !== undefined && depth > options.maxDepth) {
    if (!valuesEqual(left, right, options)) {
      operations.push({
        op: "replace",
        path: pathToJsonPointer(segments),
        value: right,
      });
    }
    return;
  }

  const normalizedLeft = normalizeValue(left, options);
  const normalizedRight = normalizeValue(right, options);

  if (valuesEqual(normalizedLeft, normalizedRight, options)) {
    return;
  }

  if (normalizedLeft === undefined && normalizedRight !== undefined) {
    operations.push({
      op: "add",
      path: pathToJsonPointer(segments),
      value: right,
    });
    return;
  }

  if (normalizedLeft !== undefined && normalizedRight === undefined) {
    operations.push({
      op: "remove",
      path: pathToJsonPointer(segments),
    });
    return;
  }

  const leftIsArray = Array.isArray(left);
  const rightIsArray = Array.isArray(right);

  if (leftIsArray && rightIsArray) {
    const maxLength = Math.max(left.length, right.length);
    for (let index = maxLength - 1; index >= 0; index -= 1) {
      const lVal = left[index];
      const rVal = right[index];
      if (index >= left.length) {
        operations.push({
          op: "add",
          path: pathToJsonPointer([...segments, String(index)]),
          value: rVal,
        });
      } else if (index >= right.length) {
        operations.push({
          op: "remove",
          path: pathToJsonPointer([...segments, String(index)]),
        });
      } else {
        generatePatchRecursive(
          lVal,
          rVal,
          [...segments, String(index)],
          operations,
          options,
          depth + 1,
        );
      }
    }
    return;
  }

  if (isObject(left) && isObject(right)) {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
    for (const key of keys) {
      generatePatchRecursive(
        left[key],
        right[key],
        [...segments, key],
        operations,
        options,
        depth + 1,
      );
    }
    return;
  }

  operations.push({
    op: "replace",
    path: pathToJsonPointer(segments),
    value: right,
  });
}

export function generatePatch(
  left: unknown,
  right: unknown,
  options: DiffOptions = {},
): JsonPatchOperation[] {
  const operations: JsonPatchOperation[] = [];
  generatePatchRecursive(left, right, [], operations, options, 0);
  return operations;
}

export function generatePatchFromDiff(
  left: unknown,
  right: unknown,
  options: DiffOptions = {},
): JsonPatchOperation[] {
  return generatePatch(left, right, options);
}

export function applyPatch(value: unknown, operations: JsonPatchOperation[]): unknown {
  const result = structuredClone(value);

  for (const operation of operations) {
    const segments = operation.path
      .split("/")
      .slice(1)
      .map((segment) => segment.replace(/~1/g, "/").replace(/~0/g, "~"));

    let parent: unknown = result;
    for (let index = 0; index < segments.length - 1; index += 1) {
      const segment = segments[index];
      if (!segment) continue;
      if (Array.isArray(parent)) {
        parent = parent[Number(segment)];
      } else if (isObject(parent)) {
        parent = parent[segment];
      }
    }

    const lastSegment = segments.at(-1);
    if (!lastSegment) continue;

    if (operation.op === "add") {
      if (Array.isArray(parent)) {
        if (lastSegment === "-") {
          parent.push(operation.value);
        } else {
          parent.splice(Number(lastSegment), 0, operation.value);
        }
      } else if (isObject(parent)) {
        parent[lastSegment] = operation.value;
      } else if (segments.length === 0) {
        return operation.value;
      }
    } else if (operation.op === "remove") {
      if (Array.isArray(parent)) {
        parent.splice(Number(lastSegment), 1);
      } else if (isObject(parent)) {
        delete parent[lastSegment];
      }
    } else if (operation.op === "replace") {
      if (Array.isArray(parent)) {
        parent[Number(lastSegment)] = operation.value;
      } else if (isObject(parent)) {
        parent[lastSegment] = operation.value;
      } else if (segments.length === 0) {
        return operation.value;
      }
    }
  }

  return result;
}

export function formatPatch(operations: JsonPatchOperation[]): string {
  return JSON.stringify(operations, null, 2);
}
