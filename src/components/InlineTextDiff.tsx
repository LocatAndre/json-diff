import type { TextDiffSegment } from "@/lib/textDiff";
import { cn } from "@/lib/utils";

interface InlineTextDiffProps {
  segments: TextDiffSegment[];
  className?: string;
}

const SEGMENT_STYLES = {
  unchanged: "",
  added:
    "bg-[color-mix(in_srgb,var(--color-added)_25%,transparent)] text-[var(--color-added)]",
  removed:
    "bg-[color-mix(in_srgb,var(--color-removed)_25%,transparent)] text-[var(--color-removed)] line-through",
} as const;

export function InlineTextDiff({ segments, className }: InlineTextDiffProps) {
  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-md border border-border bg-[var(--color-inset)] p-3 font-mono text-sm leading-6",
        className,
      )}
    >
      <code>
        {segments.map((segment) => (
          <span
            key={`${segment.type}-${segment.text}`}
            className={SEGMENT_STYLES[segment.type]}
          >
            {segment.text}
          </span>
        ))}
      </code>
    </pre>
  );
}
