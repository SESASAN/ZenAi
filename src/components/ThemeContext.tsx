import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

const THEME_KEY = "zenai-theme";

type Theme = "neon" | "sunset";

interface ThemeContextValue {
  isAltTheme: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isAltTheme, setIsAltTheme] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(THEME_KEY) === "sunset";
  });

  useEffect(() => {
    const theme: Theme = isAltTheme ? "sunset" : "neon";
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [isAltTheme]);

  const toggleTheme = () => {
    setIsAltTheme(!isAltTheme);
  };

  return (
    <ThemeContext.Provider value={{ isAltTheme, toggleTheme }}>
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