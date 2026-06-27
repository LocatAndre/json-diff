export type SplitLineType = "unchanged" | "added" | "removed" | "changed";

export interface SplitDiffLine {
  left: string | null;
  right: string | null;
  type: SplitLineType;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pad(level: number, indentSize: number): string {
  return " ".repeat(level * indentSize);
}

function renderValue(value: unknown, level: number, indentSize: number): string[] {
  if (value === null || typeof value !== "object") {
    return [JSON.stringify(value)];
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return ["[]"];

    const lines: string[] = ["["];
    for (let index = 0; index < value.length; index += 1) {
      const isLast = index === value.length - 1;
      const comma = isLast ? "" : ",";
      const childLines = renderValue(value[index], level + 1, indentSize);

      if (childLines.length === 1) {
        lines.push(`${pad(level + 1, indentSize)}${childLines[0]}${comma}`);
      } else {
        lines.push(`${pad(level + 1, indentSize)}${childLines[0]}`);
        lines.push(...childLines.slice(1, -1));
        lines.push(`${childLines[childLines.length - 1]}${comma}`);
      }
    }
    lines.push(`${pad(level, indentSize)}]`);
    return lines;
  }

  const keys = Object.keys(value as Record<string, unknown>).sort();
  if (keys.length === 0) return ["{}"];

  const record = value as Record<string, unknown>;
  const lines: string[] = ["{"];
  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];
    lines.push(
      ...renderProperty(
        key,
        record[key],
        level + 1,
        indentSize,
        index === keys.length - 1,
      ),
    );
  }
  lines.push(`${pad(level, indentSize)}}`);
  return lines;
}

function renderProperty(
  key: string,
  value: unknown,
  level: number,
  indentSize: number,
  isLast: boolean,
): string[] {
  const comma = isLast ? "" : ",";
  const prefix = `${pad(level, indentSize)}${JSON.stringify(key)}: `;

  if (value === null || typeof value !== "object") {
    return [`${prefix}${JSON.stringify(value)}${comma}`];
  }

  const inner = renderValue(value, level, indentSize);
  if (inner.length === 1) {
    return [`${prefix}${inner[0]}${comma}`];
  }

  return [
    `${prefix}${inner[0]}`,
    ...inner.slice(1, -1),
    `${inner[inner.length - 1]}${comma}`,
  ];
}

function renderSubtree(value: unknown, indentSize: number): string[] {
  return renderValue(value, 0, indentSize);
}

function emitSubtree(
  left: unknown | undefined,
  right: unknown | undefined,
  indentSize: number,
  type: "added" | "removed",
): SplitDiffLine[] {
  const value = type === "added" ? right : left;
  if (value === undefined) {
    throw new Error(
      "emitSubtree requires a defined value for added or removed subtree",
    );
  }
  const lines = renderSubtree(value, indentSize);
  return lines.map((line) => ({
    left: type === "removed" ? line : null,
    right: type === "added" ? line : null,
    type,
  }));
}

function makePrimitiveLine(
  left: unknown,
  right: unknown,
  level: number,
  key: string | null,
  indentSize: number,
  isLast: boolean,
  type: SplitLineType,
): SplitDiffLine {
  const comma = isLast ? "" : ",";
  const p = pad(level, indentSize);
  const keyPrefix = key !== null ? `${p}${JSON.stringify(key)}: ` : p;

  const leftLine =
    left !== undefined ? `${keyPrefix}${JSON.stringify(left)}${comma}` : null;

  const rightLine =
    right !== undefined ? `${keyPrefix}${JSON.stringify(right)}${comma}` : null;

  return { left: leftLine, right: rightLine, type };
}

function makeInlineLine(
  left: unknown,
  right: unknown,
  level: number,
  indentSize: number,
  isLast: boolean,
  type: SplitLineType,
): SplitDiffLine {
  const comma = isLast ? "" : ",";
  const p = pad(level, indentSize);

  return {
    left: left !== undefined ? `${p}${JSON.stringify(left)}${comma}` : null,
    right: right !== undefined ? `${p}${JSON.stringify(right)}${comma}` : null,
    type,
  };
}

function diffArrays(
  left: unknown[],
  right: unknown[],
  level: number,
  key: string | null,
  indentSize: number,
  isLast: boolean,
): SplitDiffLine[] {
  const lines: SplitDiffLine[] = [];
  const comma = isLast ? "" : ",";
  const p = pad(level, indentSize);
  const keyPrefix = key !== null ? `${p}${JSON.stringify(key)}: ` : p;
  const maxLength = Math.max(left.length, right.length);

  const openLeft = key !== null ? `${keyPrefix}[` : "[";
  const openRight = key !== null ? `${keyPrefix}[` : "[";
  lines.push({ left: openLeft, right: openRight, type: "unchanged" });

  for (let index = 0; index < maxLength; index += 1) {
    const lVal = left[index];
    const rVal = right[index];
    const itemIsLast = index === maxLength - 1;
    const lExists = index < left.length;
    const rExists = index < right.length;

    if (!lExists && rExists) {
      lines.push(
        ...emitSubtree(undefined, rVal, indentSize, "added").map((line, i, arr) => {
          if (arr.length === 1) {
            const content = line.right;
            if (content === null) {
              throw new Error("Expected added line content for right side");
            }
            const itemComma = itemIsLast ? "" : ",";
            return {
              left: null,
              right: `${pad(level + 1, indentSize)}${content}${itemComma}`,
              type: "added" as const,
            };
          }
          if (i === 0) {
            return {
              left: null,
              right: `${pad(level + 1, indentSize)}${line.right}`,
              type: "added" as const,
            };
          }
          if (i === arr.length - 1) {
            const itemComma = itemIsLast ? "" : ",";
            return {
              left: null,
              right: `${line.right}${itemComma}`,
              type: "added" as const,
            };
          }
          return line;
        }),
      );
    } else if (lExists && !rExists) {
      lines.push(
        ...emitSubtree(lVal, undefined, indentSize, "removed").map((line, i, arr) => {
          if (arr.length === 1) {
            const content = line.left;
            if (content === null) {
              throw new Error("Expected removed line content for left side");
            }
            const itemComma = itemIsLast ? "" : ",";
            return {
              left: `${pad(level + 1, indentSize)}${content}${itemComma}`,
              right: null,
              type: "removed" as const,
            };
          }
          if (i === 0) {
            return {
              left: `${pad(level + 1, indentSize)}${line.left}`,
              right: null,
              type: "removed" as const,
            };
          }
          if (i === arr.length - 1) {
            const itemComma = itemIsLast ? "" : ",";
            return {
              left: `${line.left}${itemComma}`,
              right: null,
              type: "removed" as const,
            };
          }
          return line;
        }),
      );
    } else {
      lines.push(...diffNode(lVal, rVal, level + 1, null, itemIsLast, indentSize));
    }
  }

  const closeLine = `${pad(level, indentSize)}]${comma}`;
  lines.push({ left: closeLine, right: closeLine, type: "unchanged" });
  return lines;
}

function diffObjects(
  left: Record<string, unknown>,
  right: Record<string, unknown>,
  level: number,
  key: string | null,
  indentSize: number,
  isLast: boolean,
): SplitDiffLine[] {
  const lines: SplitDiffLine[] = [];
  const comma = isLast ? "" : ",";
  const p = pad(level, indentSize);
  const keyPrefix = key !== null ? `${p}${JSON.stringify(key)}: ` : p;

  const allKeys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
  const openLeft = key !== null ? `${keyPrefix}{` : "{";
  const openRight = key !== null ? `${keyPrefix}{` : "{";
  lines.push({ left: openLeft, right: openRight, type: "unchanged" });

  for (let index = 0; index < allKeys.length; index += 1) {
    const propKey = allKeys[index];
    const lExists = propKey in left;
    const rExists = propKey in right;
    const propIsLast = index === allKeys.length - 1;

    if (!lExists && rExists) {
      lines.push(
        ...diffNode(
          undefined,
          right[propKey],
          level + 1,
          propKey,
          propIsLast,
          indentSize,
        ),
      );
    } else if (lExists && !rExists) {
      lines.push(
        ...diffNode(
          left[propKey],
          undefined,
          level + 1,
          propKey,
          propIsLast,
          indentSize,
        ),
      );
    } else {
      lines.push(
        ...diffNode(
          left[propKey],
          right[propKey],
          level + 1,
          propKey,
          propIsLast,
          indentSize,
        ),
      );
    }
  }

  const closeLine = `${pad(level, indentSize)}}${comma}`;
  lines.push({ left: closeLine, right: closeLine, type: "unchanged" });
  return lines;
}

function diffNode(
  left: unknown | undefined,
  right: unknown | undefined,
  level: number,
  key: string | null,
  isLast: boolean,
  indentSize: number,
): SplitDiffLine[] {
  const leftExists = left !== undefined;
  const rightExists = right !== undefined;

  if (!leftExists && rightExists) {
    if (key !== null) {
      return diffSubtreeAsProperty(
        undefined,
        right,
        level,
        key,
        isLast,
        indentSize,
        "added",
      );
    }
    return emitSubtree(undefined, right, indentSize, "added");
  }

  if (leftExists && !rightExists) {
    if (key !== null) {
      return diffSubtreeAsProperty(
        left,
        undefined,
        level,
        key,
        isLast,
        indentSize,
        "removed",
      );
    }
    return emitSubtree(left, undefined, indentSize, "removed");
  }

  if (!leftExists && !rightExists) {
    return [];
  }

  if (left === undefined || right === undefined) {
    return [];
  }

  if (Object.is(left, right)) {
    if (key !== null) {
      return [
        makePrimitiveLine(left, right, level, key, indentSize, isLast, "unchanged"),
      ];
    }
    if (left === null || typeof left !== "object") {
      return [makeInlineLine(left, right, level, indentSize, isLast, "unchanged")];
    }
    return diffRootUnchanged(left, indentSize);
  }

  const leftIsArray = Array.isArray(left);
  const rightIsArray = Array.isArray(right);

  if (leftIsArray && rightIsArray) {
    return diffArrays(left, right, level, key, indentSize, isLast);
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    return diffObjects(left, right, level, key, indentSize, isLast);
  }

  if (key !== null) {
    return [makePrimitiveLine(left, right, level, key, indentSize, isLast, "changed")];
  }

  return [makeInlineLine(left, right, level, indentSize, isLast, "changed")];
}

function diffSubtreeAsProperty(
  left: unknown | undefined,
  right: unknown | undefined,
  level: number,
  key: string,
  isLast: boolean,
  indentSize: number,
  type: "added" | "removed",
): SplitDiffLine[] {
  const value = type === "added" ? right : left;
  if (value === undefined) {
    throw new Error(
      "diffSubtreeAsProperty requires a defined value for added or removed subtree",
    );
  }
  const propLines = renderProperty(key, value, level, indentSize, isLast);
  return propLines.map((line) => ({
    left: type === "removed" ? line : null,
    right: type === "added" ? line : null,
    type,
  }));
}

function diffRootUnchanged(left: unknown, indentSize: number): SplitDiffLine[] {
  const leftLines = renderSubtree(left, indentSize);
  return leftLines.map((line) => ({
    left: line,
    right: line,
    type: "unchanged" as const,
  }));
}

export function buildSplitDiff(
  left: unknown,
  right: unknown,
  indentSize = 2,
): SplitDiffLine[] {
  return diffNode(left, right, 0, null, true, indentSize);
}

export interface NumberedSplitDiffLine extends SplitDiffLine {
  leftLineNumber: number | null;
  rightLineNumber: number | null;
}

export function numberSplitDiffLines(lines: SplitDiffLine[]): NumberedSplitDiffLine[] {
  let leftNum = 0;
  let rightNum = 0;

  return lines.map((line) => {
    const leftLineNumber = line.left !== null ? ++leftNum : null;
    const rightLineNumber = line.right !== null ? ++rightNum : null;
    return { ...line, leftLineNumber, rightLineNumber };
  });
}
