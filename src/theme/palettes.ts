export type ThemeId =
  | "neon"
  | "sunset"
  | "violet"
  | "emerald"
  | "red"
  | "yellow"
  | "white";

export type ThemePalette = {
  id: ThemeId;
  label: string;
  /** Accent color. Must match the `[data-theme]` rule in styles/tokens.css. */
  swatch: string;
};

/** The ground is always neutral; each theme only changes the accent color. */
export const THEME_PALETTES: ThemePalette[] = [
  { id: "emerald", label: "Jade", swatch: "#5bc8a6" },
  { id: "neon", label: "Cian", swatch: "#5cc3d6" },
  { id: "violet", label: "Violeta", swatch: "#a78bfa" },
  { id: "sunset", label: "Atardecer", swatch: "#e39a55" },
  { id: "red", label: "Rojo", swatch: "#e07a7a" },
  { id: "yellow", label: "Amarillo", swatch: "#e3c064" },
  { id: "white", label: "Gris", swatch: "#d4d4d8" },
];

export const DEFAULT_THEME_ID: ThemeId = "emerald";

export function isThemeId(value: string): value is ThemeId {
  return THEME_PALETTES.some((t) => t.id === value);
}

export function getAccent(themeId: ThemeId) {
  return THEME_PALETTES.find((t) => t.id === themeId)?.swatch ?? THEME_PALETTES[0]!.swatch;
}
