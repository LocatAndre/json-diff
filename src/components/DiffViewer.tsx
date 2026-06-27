import { CodeBlock } from "@/components/code-block";
import { InlineTextDiff } from "@/components/InlineTextDiff";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import type { DiffEntry } from "@/lib/jsonDiff";
import { formatValue } from "@/lib/jsonDiff";
import { diffText } from "@/lib/textDiff";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages.js";

interface DiffViewerProps {
  entries: DiffEntry[];
  viewMode: "all" | "changes";
  searchQuery?: string;
}

const TYPE_STYLES = {
  added:
    "border-[color-mix(in_srgb,var(--color-added)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-added)_10%,transparent)]",
  removed:
    "border-[color-mix(in_srgb,var(--color-removed)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-removed)_10%,transparent)]",
  changed:
    "border-[color-mix(in_srgb,var(--color-changed)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-changed)_10%,transparent)]",
  unchanged: "border-border bg-[var(--color-inset)]",
} as const;

const BADGE_STYLES = {
  added: "bg-[var(--color-inset-strong)] text-[var(--color-added)]",
  removed: "bg-[var(--color-inset-strong)] text-[var(--color-removed)]",
  changed: "bg-[var(--color-inset-strong)] text-[var(--color-changed)]",
  unchanged: "bg-[var(--color-inset-strong)] text-muted-foreground",
} as const;

function getTypeLabel(type: DiffEntry["type"]): string {
  switch (type) {
    case "added":
      return m.diff_type_added();
    case "removed":
      return m.diff_type_removed();
    case "changed":
      return m.diff_type_changed();
    case "unchanged":
      return m.diff_type_unchanged();
  }
}

function highlightPath(path: string, query: string): React.ReactNode {
  if (!query.trim()) {
    return path;
  }

  const lowerPath = path.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerPath.indexOf(lowerQuery);

  if (index === -1) {
    return path;
  }

  return (
    <>
      {path.slice(0, index)}
      <mark className="rounded bg-[color-mix(in_srgb,var(--color-accent)_30%,transparent)] px-0.5">
        {path.slice(index, index + query.length)}
      </mark>
      {path.slice(index + query.length)}
    </>
  );
}

function ValueDisplay({ entry, side }: { entry: DiffEntry; side: "left" | "right" }) {
  const value = side === "left" ? entry.left : entry.right;

  if (
    entry.type === "changed" &&
    typeof entry.left === "string" &&
    typeof entry.right === "string"
  ) {
    const segments = diffText(entry.left, entry.right, "word");
    return <InlineTextDiff segments={segments} />;
  }

  return <CodeBlock>{formatValue(value)}</CodeBlock>;
}

export function DiffViewer({ entries, viewMode, searchQuery = "" }: DiffViewerProps) {
  const visibleEntries =
    viewMode === "changes"
      ? entries.filter((entry) => entry.type !== "unchanged")
      : entries;

  if (visibleEntries.length === 0) {
    return (
      <Alert className="border-dashed">
        <AlertDescription className="text-center">
          {searchQuery.trim()
            ? m.diff_search_no_results()
            : viewMode === "changes"
              ? m.diff_identical()
              : m.diff_no_items()}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <ItemGroup>
      {visibleEntries.map((entry) => (
        <Item
          key={`${entry.path}-${entry.type}-${entry.matchedBy ?? "default"}`}
          variant="outline"
          className={cn("flex-col items-stretch", TYPE_STYLES[entry.type])}
        >
          <ItemHeader className="w-full flex-wrap gap-2">
            <Badge
              variant="secondary"
              className={cn("uppercase", BADGE_STYLES[entry.type])}
            >
              {getTypeLabel(entry.type)}
            </Badge>
            <ItemTitle className="font-mono font-normal">
              {highlightPath(entry.path, searchQuery)}
            </ItemTitle>
          </ItemHeader>

          <ItemContent className="w-full">
            {(entry.type === "changed" ||
              entry.type === "removed" ||
              entry.type === "added") && (
              <div
                className={cn(
                  "grid gap-3",
                  entry.type === "changed" &&
                    !(
                      typeof entry.left === "string" && typeof entry.right === "string"
                    ) &&
                    "md:grid-cols-2",
                )}
              >
                {(entry.type === "changed" || entry.type === "removed") && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">
                      {m.diff_before()}
                    </Label>
                    <ValueDisplay entry={entry} side="left" />
                  </div>
                )}

                {(entry.type === "changed" || entry.type === "added") && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">
                      {m.diff_after()}
                    </Label>
                    <ValueDisplay entry={entry} side="right" />
                  </div>
                )}
              </div>
            )}

            {entry.type === "unchanged" && (
              <CodeBlock>{formatValue(entry.left)}</CodeBlock>
            )}
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  );
}
