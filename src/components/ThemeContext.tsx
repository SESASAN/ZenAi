import { useState, useEffect, type ReactNode } from "react";
import { DEFAULT_THEME_ID, isThemeId, type ThemeId, THEME_PALETTES } from "@/theme/palettes";
import { ThemeContext } from "./themeContext";

const THEME_KEY = "zenai-theme";

function readStoredTheme(): ThemeId {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw && isThemeId(raw)) return raw;
  } catch {
    // Storage unavailable (private mode, blocked cookies...).
  }
  return DEFAULT_THEME_ID;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() =>
    typeof window === "undefined" ? DEFAULT_THEME_ID : readStoredTheme(),
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeId);
    document.body.setAttribute("data-theme", themeId);
    try {
      localStorage.setItem(THEME_KEY, themeId);
    } catch {
      // ignore
    }
  }, [themeId]);

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, palettes: THEME_PALETTES }}>
      {children}
    </ThemeContext.Provider>
  );
}
