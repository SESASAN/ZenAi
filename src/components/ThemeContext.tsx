import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { isThemeId, type ThemeId, THEME_PALETTES } from "@/theme/palettes";

const THEME_KEY = "zenai-theme";

interface ThemeContextValue {
  themeId: ThemeId;
  setThemeId: (themeId: ThemeId) => void;
  palettes: typeof THEME_PALETTES;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    if (typeof window === "undefined") return "neon";
    const raw = localStorage.getItem(THEME_KEY);
    if (raw && isThemeId(raw)) return raw;
    return "neon";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeId);
    document.body.setAttribute("data-theme", themeId);
    localStorage.setItem(THEME_KEY, themeId);
  }, [themeId]);

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, palettes: THEME_PALETTES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
