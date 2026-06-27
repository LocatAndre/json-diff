import { Palette } from "lucide-react";
import { useSyncExternalStore } from "react";
import { SelectField } from "@/components/select-field";
import {
  DEFAULT_THEME,
  getStoredTheme,
  STANDALONE_THEME_IDS,
  setTheme,
  THEME_GROUPS,
  THEME_IDS,
  type ThemeId,
} from "@/lib/theme";
import {
  getThemeGroupLabel,
  getThemeLabel,
  getThemeVariantLabel,
} from "@/lib/themeMessages";
import { m } from "@/paraglide/messages.js";

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): ThemeId {
  const theme = document.documentElement.dataset.theme;
  if (theme && THEME_IDS.includes(theme as ThemeId)) {
    return theme as ThemeId;
  }
  return getStoredTheme();
}

type ThemeSelectorVariant = "default" | "compact" | "menu";

export function ThemeSelector({
  variant = "default",
  compact = false,
}: {
  variant?: ThemeSelectorVariant;
  /** @deprecated Use `variant="compact"` instead */
  compact?: boolean;
}) {
  const resolvedVariant = compact ? "compact" : variant;
  const isCompact = resolvedVariant === "compact";
  const isMenu = resolvedVariant === "menu";

  const currentTheme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => DEFAULT_THEME,
  );

  const options = STANDALONE_THEME_IDS.map((theme) => ({
    value: theme,
    label: getThemeLabel(theme),
  }));

  const groups = THEME_GROUPS.map((group) => ({
    label: getThemeGroupLabel(group.id),
    options: group.themes.map((theme) => ({
      value: theme,
      label: getThemeVariantLabel(theme),
    })),
  }));

  const displayItems = Object.fromEntries(
    THEME_IDS.map((theme) => [theme, getThemeLabel(theme)]),
  );

  return (
    <SelectField
      id={isMenu ? "theme-menu" : "theme"}
      label={m.theme_label()}
      value={currentTheme}
      onValueChange={(value) => setTheme(value as ThemeId)}
      options={options}
      groups={groups}
      displayItems={displayItems}
      size={isCompact ? "sm" : "default"}
      orientation={isMenu ? "vertical" : "horizontal"}
      labelClassName={isCompact ? "sr-only" : undefined}
      fieldClassName={isMenu ? "w-full" : undefined}
      icon={
        isCompact || isMenu ? (
          <Palette
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        ) : undefined
      }
      triggerClassName={
        isMenu ? "w-full" : isCompact ? "w-[6.5rem] sm:w-32 md:w-[200px]" : "w-[200px]"
      }
    />
  );
}
