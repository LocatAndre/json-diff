export type ThemeId =
  | "midnight"
  | "light"
  | "ocean"
  | "forest"
  | "sunset"
  | "gruvbox"
  | "catppuccin-latte"
  | "catppuccin-frappe"
  | "catppuccin-macchiato"
  | "catppuccin-mocha"
  | "tokyo-night"
  | "tokyo-night-storm"
  | "tokyo-night-moon"
  | "tokyo-night-day";

export type ThemeGroupId = "catppuccin" | "tokyo-night";

export interface ThemeGroup {
  id: ThemeGroupId;
  themes: ThemeId[];
}

export const STANDALONE_THEME_IDS: ThemeId[] = [
  "midnight",
  "light",
  "ocean",
  "forest",
  "sunset",
  "gruvbox",
];

export const THEME_GROUPS: ThemeGroup[] = [
  {
    id: "catppuccin",
    themes: [
      "catppuccin-latte",
      "catppuccin-frappe",
      "catppuccin-macchiato",
      "catppuccin-mocha",
    ],
  },
  {
    id: "tokyo-night",
    themes: ["tokyo-night", "tokyo-night-storm", "tokyo-night-moon", "tokyo-night-day"],
  },
];

export const THEME_IDS: ThemeId[] = [
  ...STANDALONE_THEME_IDS,
  ...THEME_GROUPS.flatMap((group) => group.themes),
];

const LIGHT_THEMES = new Set<ThemeId>(["light", "catppuccin-latte", "tokyo-night-day"]);

export const DEFAULT_THEME: ThemeId = "midnight";
const STORAGE_KEY = "json-diff-theme";

export function isLightTheme(theme: ThemeId): boolean {
  return LIGHT_THEMES.has(theme);
}

export function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && THEME_IDS.includes(stored as ThemeId)) {
    return stored as ThemeId;
  }

  return DEFAULT_THEME;
}

export function applyTheme(theme: ThemeId): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", !isLightTheme(theme));
}

export function setTheme(theme: ThemeId): void {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

export function initTheme(): ThemeId {
  const theme = getStoredTheme();
  applyTheme(theme);
  return theme;
}
