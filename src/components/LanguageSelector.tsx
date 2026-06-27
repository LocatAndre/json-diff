import { Languages } from "lucide-react";
import { SelectField } from "@/components/select-field";
import { m } from "@/paraglide/messages.js";
import { getLocale, locales, setLocale } from "@/paraglide/runtime.js";

const LOCALE_LABELS: Record<string, () => string> = {
  en: () => m.language_en(),
  it: () => m.language_it(),
};

type LanguageSelectorVariant = "default" | "compact" | "menu";

export function LanguageSelector({
  variant = "default",
  compact = false,
}: {
  variant?: LanguageSelectorVariant;
  /** @deprecated Use `variant="compact"` instead */
  compact?: boolean;
}) {
  const resolvedVariant = compact ? "compact" : variant;
  const isCompact = resolvedVariant === "compact";
  const isMenu = resolvedVariant === "menu";

  return (
    <SelectField
      id={isMenu ? "language-menu" : "language"}
      label={m.language_label()}
      value={getLocale()}
      onValueChange={(value) => setLocale(value as "en" | "it")}
      options={locales.map((locale) => ({
        value: locale,
        label: LOCALE_LABELS[locale]?.() ?? locale,
      }))}
      size={isCompact ? "sm" : "default"}
      orientation={isMenu ? "vertical" : "horizontal"}
      labelClassName={isCompact ? "sr-only" : undefined}
      fieldClassName={isMenu ? "w-full" : undefined}
      icon={
        isCompact || isMenu ? (
          <Languages
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        ) : undefined
      }
      triggerClassName={
        isMenu ? "w-full" : isCompact ? "w-[5.75rem] sm:w-28 md:w-[180px]" : "w-[180px]"
      }
    />
  );
}
