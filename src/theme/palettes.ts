export type ThemeId =
  | "neon"
  | "sunset"
  | "violet"
  | "emerald"
  | "red"
  | "yellow"
  | "white";

export interface ThemePalette {
  id: ThemeId;
  label: string;
  /** Used only for the palette UI swatch (not the actual CSS tokens). */
  swatch: string;
}

export const THEME_PALETTES: ThemePalette[] = [
  { id: "neon", label: "Neon", swatch: "#00e5ff" },
  { id: "sunset", label: "Sunset", swatch: "#ff8c00" },
  { id: "violet", label: "Violet", swatch: "#a78bfa" },
  { id: "emerald", label: "Emerald", swatch: "#22c55e" },
  { id: "red", label: "Red", swatch: "#ef4444" },
  { id: "yellow", label: "Yellow", swatch: "#fbbf24" },
  { id: "white", label: "White", swatch: "#e5e7eb" },
];

export function isThemeId(value: string): value is ThemeId {
  return THEME_PALETTES.some((t) => t.id === value);
}
