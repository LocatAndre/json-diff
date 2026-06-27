import type { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  buildSplitDiff,
  numberSplitDiffLines,
  type SplitLineType,
} from "@/lib/splitDiff";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages.js";

interface SplitDiffViewerProps {
  left: unknown;
  right: unknown;
  viewMode: "all" | "changes";
  indentSize?: number;
}

const ROW_STYLES: Record<SplitLineType, string> = {
  added: "bg-[color-mix(in_srgb,var(--color-added)_18%,transparent)]",
  removed: "bg-[color-mix(in_srgb,var(--color-removed)_18%,transparent)]",
  changed: "bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)]",
  unchanged: "",
};

const JSON_TOKEN =
  /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[{}[\],:]/g;

function highlightJsonLine(line: string) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  JSON_TOKEN.lastIndex = 0;
  let match = JSON_TOKEN.exec(line);
  while (match !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }

    const [token, quoted, colon] = match;

    if (quoted && colon) {
      parts.push(
        <span key={key++} className="text-[var(--color-accent)]">
          {quoted}
        </span>,
      );
      parts.push(
        <span key={key++} className="text-muted-foreground">
          {colon}
        </span>,
      );
    } else if (quoted) {
      parts.push(
        <span key={key++} className="text-[var(--color-added)]">
          {quoted}
        </span>,
      );
    } else if (token === "true" || token === "false" || token === "null") {
      parts.push(
        <span key={key++} className="text-[var(--color-changed)]">
          {token}
        </span>,
      );
    } else if (/^-?\d/.test(token)) {
      parts.push(
        <span key={key++} className="text-[var(--color-accent)]">
          {token}
        </span>,
      );
    } else {
      parts.push(
        <span key={key++} className="text-muted-foreground">
          {token}
        </span>,
      );
    }

    lastIndex = match.index + token.length;
    match = JSON_TOKEN.exec(line);
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts.length > 0 ? parts : line;
}

function DiffPanel({
  side,
  lines,
}: {
  side: "left" | "right";
  lines: ReturnType<typeof numberSplitDiffLines>;
}) {
  const contentKey = side === "left" ? "left" : "right";
  const lineNumberKey = side === "left" ? "leftLineNumber" : "rightLineNumber";

  return (
    <div className="min-w-0 flex-1 overflow-hidden">
      <ScrollArea className="h-[min(28rem,60vh)] rounded-lg border border-border bg-[var(--color-inset)]">
        <div className="font-mono text-xs leading-5">
          {lines.map((line) => {
            const content = line[contentKey];
            const lineNumber = line[lineNumberKey];

            return (
              <div
                key={`${side}-${lineNumber ?? "gap"}-${content ?? "empty"}`}
                className={cn(
                  "flex min-h-5",
                  content === null &&
                    "bg-[color-mix(in_srgb,var(--color-inset-strong)_50%,transparent)]",
                  content !== null && ROW_STYLES[line.type],
                )}
              >
                <span className="w-10 shrink-0 select-none border-border/50 border-r pr-2 text-right text-muted-foreground/70">
                  {lineNumber ?? ""}
                </span>
                <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre px-2">
                  {content !== null ? highlightJsonLine(content) : "\u00a0"}
                </pre>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

export function SplitDiffViewer({
  left,
  right,
  viewMode,
  indentSize = 2,
}: SplitDiffViewerProps) {
  const allLines = numberSplitDiffLines(buildSplitDiff(left, right, indentSize));
  const lines =
    viewMode === "changes"
      ? allLines.filter((line) => line.type !== "unchanged")
      : allLines;

  if (lines.length === 0) {
    return (
      <Alert className="border-dashed">
        <AlertDescription className="text-center">
          {viewMode === "changes" ? m.diff_identical() : m.diff_no_items()}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-2 lg:grid-cols-2">
      <div className="space-y-1">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          {m.json_a()}
        </p>
        <DiffPanel side="left" lines={lines} />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          {m.json_b()}
        </p>
        <DiffPanel side="right" lines={lines} />
      </div>
    </div>
  );
}
