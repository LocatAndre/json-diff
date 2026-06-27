import { m } from "@/paraglide/messages.js";
import type { FormatMode } from "./jsonFormat";

export function getFormatLabel(mode: FormatMode): string {
  switch (mode) {
    case "none":
      return m.format_none_label();
    case "sorted-keys":
      return m.format_sorted_keys_label();
    case "pretty-2":
      return m.format_pretty_2_label();
    case "pretty-4":
      return m.format_pretty_4_label();
    case "compact":
      return m.format_compact_label();
    case "sorted-pretty-2":
      return m.format_sorted_pretty_2_label();
    case "sorted-pretty-4":
      return m.format_sorted_pretty_4_label();
    case "sorted-compact":
      return m.format_sorted_compact_label();
  }
}

export function getFormatDescription(mode: FormatMode): string {
  switch (mode) {
    case "none":
      return m.format_none_description();
    case "sorted-keys":
      return m.format_sorted_keys_description();
    case "pretty-2":
      return m.format_pretty_2_description();
    case "pretty-4":
      return m.format_pretty_4_description();
    case "compact":
      return m.format_compact_description();
    case "sorted-pretty-2":
      return m.format_sorted_pretty_2_description();
    case "sorted-pretty-4":
      return m.format_sorted_pretty_4_description();
    case "sorted-compact":
      return m.format_sorted_compact_description();
  }
}
