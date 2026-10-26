import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "@/components/useTheme";
import { useFavicon } from "@/components/useFavicon";

interface ThemeToggleProps {
  /** Wrapper class (positioning). */
  className?: string;
  /** Where the palette opens relative to the button. */
  align?: "start" | "end";
  /** Opens upwards (e.g. from the bottom of the sidebar). */
  placement?: "bottom" | "top";
}

/** Small accent-color picker. The ground stays neutral; only the accent changes. */
export function ThemeToggle({ className = "", align = "end", placement = "bottom" }: ThemeToggleProps) {
  const { themeId, setThemeId, palettes } = useTheme();
  const popoverId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const current = palettes.find((p) => p.id === themeId);

  useFavicon(themeId);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (ev: PointerEvent) => {
      if (rootRef.current?.contains(ev.target as Node)) return;
      setOpen(false);
    };
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`theme-palette ${className}`}>
      <button
        type="button"
        className="iconBtn theme-palette__trigger"
        aria-label={`Cambiar color de acento (actual: ${current?.label ?? ""})`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="theme-palette__dot" aria-hidden="true" />
      </button>

      {open ? (
        <div
          id={popoverId}
          role="dialog"
          aria-label="Color de acento"
          className={`theme-palette__popover theme-palette__popover--${align} theme-palette__popover--${placement}`}
        >
          <p className="theme-palette__title">Color de acento</p>
          <div className="theme-palette__grid" role="radiogroup" aria-label="Color de acento">
            {palettes.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={p.id === themeId}
                className={`theme-palette__swatch ${p.id === themeId ? "theme-palette__swatch--active" : ""}`}
                style={{ "--swatch": p.swatch } as React.CSSProperties}
                onClick={() => {
                  setThemeId(p.id);
                  setOpen(false);
                }}
                aria-label={p.label}
                title={p.label}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Inline (always visible) accent picker for the settings page. */
export function AccentPicker() {
  const { themeId, setThemeId, palettes } = useTheme();
  return (
    <div className="accentPicker" role="radiogroup" aria-label="Color de acento">
      {palettes.map((p) => (
        <button
          key={p.id}
          type="button"
          role="radio"
          aria-checked={p.id === themeId}
          className={`theme-palette__swatch accentPicker__swatch ${p.id === themeId ? "theme-palette__swatch--active" : ""}`}
          style={{ "--swatch": p.swatch } as React.CSSProperties}
          onClick={() => setThemeId(p.id)}
          aria-label={p.label}
          title={p.label}
        />
      ))}
    </div>
  );
}
