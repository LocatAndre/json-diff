import { m } from "@/paraglide/messages.js";
import type { ThemeGroupId, ThemeId } from "./theme";

export function getThemeLabel(theme: ThemeId): string {
  switch (theme) {
    case "midnight":
      return m.theme_midnight();
    case "light":
      return m.theme_light();
    case "ocean":
      return m.theme_ocean();
    case "forest":
      return m.theme_forest();
    case "sunset":
      return m.theme_sunset();
    case "gruvbox":
      return m.theme_gruvbox();
    case "catppuccin-latte":
      return m.theme_catppuccin_latte();
    case "catppuccin-frappe":
      return m.theme_catppuccin_frappe();
    case "catppuccin-macchiato":
      return m.theme_catppuccin_macchiato();
    case "catppuccin-mocha":
      return m.theme_catppuccin_mocha();
    case "tokyo-night":
      return m.theme_tokyo_night();
    case "tokyo-night-storm":
      return m.theme_tokyo_night_storm();
    case "tokyo-night-moon":
      return m.theme_tokyo_night_moon();
    case "tokyo-night-day":
      return m.theme_tokyo_night_day();
  }
}

export function getThemeGroupLabel(group: ThemeGroupId): string {
  switch (group) {
    case "catppuccin":
      return m.theme_group_catppuccin();
    case "tokyo-night":
      return m.theme_group_tokyo_night();
  }
}

export function getThemeVariantLabel(theme: ThemeId): string {
  switch (theme) {
    case "catppuccin-latte":
      return m.theme_variant_catppuccin_latte();
    case "catppuccin-frappe":
      return m.theme_variant_catppuccin_frappe();
    case "catppuccin-macchiato":
      return m.theme_variant_catppuccin_macchiato();
    case "catppuccin-mocha":
      return m.theme_variant_catppuccin_mocha();
    case "tokyo-night":
      return m.theme_variant_tokyo_night();
    case "tokyo-night-storm":
      return m.theme_variant_tokyo_night_storm();
    case "tokyo-night-moon":
      return m.theme_variant_tokyo_night_moon();
    case "tokyo-night-day":
      return m.theme_variant_tokyo_night_day();
    default:
      return getThemeLabel(theme);
  }
}
