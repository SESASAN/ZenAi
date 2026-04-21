import discSvg from "@/assets/disc.svg?url";
import { useTheme } from "./ThemeContext";
import { useFavicon } from "./useFavicon";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { isAltTheme, toggleTheme } = useTheme();
  
  useFavicon(isAltTheme);

  return (
    <button
      type="button"
      aria-label={isAltTheme ? "Switch to neon theme" : "Switch to sunset theme"}
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
    >
      <img
        alt={isAltTheme ? "Sunset theme" : "Neon theme"}
        src={discSvg}
        className={`theme-toggle__disc ${isAltTheme ? "theme-toggle__disc--alt" : ""}`}
      />
    </button>
  );
}