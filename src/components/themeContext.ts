import { createContext } from "react";
import type { ThemeId, THEME_PALETTES } from "@/theme/palettes";

export interface ThemeContextValue {
  themeId: ThemeId;
  setThemeId: (themeId: ThemeId) => void;
  palettes: typeof THEME_PALETTES;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
