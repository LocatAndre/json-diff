import { m } from "@/paraglide/messages.js";
import type { ArrayCompareMode } from "./jsonDiff";

export function getArrayModeLabel(mode: ArrayCompareMode): string {
  switch (mode) {
    case "by-index":
      return m.array_mode_by_index();
    case "by-value":
      return m.array_mode_by_value();
    case "by-key":
      return m.array_mode_by_key();
  }
}

export const ARRAY_MODES: ArrayCompareMode[] = ["by-index", "by-value", "by-key"];
