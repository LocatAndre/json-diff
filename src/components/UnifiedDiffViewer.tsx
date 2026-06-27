import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  buildSplitDiff,
  numberSplitDiffLines,
  type SplitLineType,
} from "@/lib/splitDiff";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages.js";

interface UnifiedDiffViewerProps {
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

const PREFIX_STYLES: Record<SplitLineType, string> = {
  added: "text-[var(--color-added)]",
  removed: "text-[var(--color-removed)]",
  changed: "text-[var(--color-changed)]",
  unchanged: "text-muted-foreground",
};

function getPrefix(
  type: SplitLineType,
  left: string | null,
  right: string | null,
): string {
  if (type === "added") return "+";
  if (type === "removed") return "-";
  if (type === "changed") {
    if (left !== null && right === null) return "-";
    if (left === null && right !== null) return "+";
    return "~";
  }
  return " ";
}

function getUnifiedContent(
  left: string | null,
  right: string | null,
  type: SplitLineType,
): string {
  if (type === "added" || (type === "changed" && left === null)) {
    return right ?? "";
  }
  if (type === "removed" || (type === "changed" && right === null)) {
    return left ?? "";
  }
  return left ?? right ?? "";
}

export function UnifiedDiffViewer({
  left,
  right,
  viewMode,
  indentSize = 2,
}: UnifiedDiffViewerProps) {
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
    <ScrollArea className="h-[min(28rem,60vh)] rounded-lg border border-border bg-[var(--color-inset)]">
      <div className="font-mono text-xs leading-5">
        {lines.map((line) => {
          const content = getUnifiedContent(line.left, line.right, line.type);
          const prefix = getPrefix(line.type, line.left, line.right);
          const lineNumber = line.leftLineNumber ?? line.rightLineNumber;

          return (
            <div
              key={`unified-${lineNumber ?? "gap"}-${content}`}
              className={cn("flex min-h-5", ROW_STYLES[line.type])}
            >
              <span className="w-10 shrink-0 select-none border-border/50 border-r pr-2 text-right text-muted-foreground/70">
                {lineNumber ?? ""}
              </span>
              <span
                className={cn(
                  "w-4 shrink-0 select-none text-center",
                  PREFIX_STYLES[line.type],
                )}
              >
                {prefix}
              </span>
              <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre px-2">
                {content || "\u00a0"}
              </pre>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
