export type TextDiffSegmentType = "unchanged" | "added" | "removed";

export interface TextDiffSegment {
  type: TextDiffSegmentType;
  text: string;
}

function getCell(matrix: number[][], row: number, col: number): number {
  return matrix[row]?.[col] ?? 0;
}

function setCell(matrix: number[][], row: number, col: number, value: number): void {
  if (!matrix[row]) {
    matrix[row] = [];
  }
  matrix[row][col] = value;
}

function lcs(a: string[], b: string[]): number[][] {
  const matrix: number[][] = [];

  for (let i = 0; i <= a.length; i += 1) {
    matrix[i] = [];
    for (let j = 0; j <= b.length; j += 1) {
      if (i === 0 || j === 0) {
        setCell(matrix, i, j, 0);
      } else if (a[i - 1] === b[j - 1]) {
        setCell(matrix, i, j, getCell(matrix, i - 1, j - 1) + 1);
      } else {
        setCell(
          matrix,
          i,
          j,
          Math.max(getCell(matrix, i - 1, j), getCell(matrix, i, j - 1)),
        );
      }
    }
  }

  return matrix;
}

function backtrack(a: string[], b: string[], matrix: number[][]): TextDiffSegment[] {
  const segments: TextDiffSegment[] = [];
  let i = a.length;
  let j = b.length;

  const pushSegment = (type: TextDiffSegmentType, text: string) => {
    if (!text) return;
    const last = segments[0];
    if (last && last.type === type) {
      last.text = text + last.text;
    } else {
      segments.unshift({ type, text });
    }
  };

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      pushSegment("unchanged", a[i - 1] ?? "");
      i -= 1;
      j -= 1;
    } else if (
      j > 0 &&
      (i === 0 || getCell(matrix, i, j - 1) >= getCell(matrix, i - 1, j))
    ) {
      pushSegment("added", b[j - 1] ?? "");
      j -= 1;
    } else if (i > 0) {
      pushSegment("removed", a[i - 1] ?? "");
      i -= 1;
    }
  }

  return segments;
}

export function diffText(
  left: string,
  right: string,
  mode: "word" | "char" = "word",
): TextDiffSegment[] {
  if (left === right) {
    return [{ type: "unchanged", text: left }];
  }

  if (mode === "char") {
    const leftChars = [...left];
    const rightChars = [...right];
    return backtrack(leftChars, rightChars, lcs(leftChars, rightChars));
  }

  const leftTokens = left.match(/\s+|[^\s]+/g) ?? [left];
  const rightTokens = right.match(/\s+|[^\s]+/g) ?? [right];
  return backtrack(leftTokens, rightTokens, lcs(leftTokens, rightTokens));
}

export function hasTextDiff(left: unknown, right: unknown): left is string {
  return typeof left === "string" && typeof right === "string";
}
