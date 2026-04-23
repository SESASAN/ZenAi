import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "@/components/ThemeContext";
import { useFavicon } from "@/components/useFavicon";
import { getDiscMarkDataUrl } from "@/branding/discMark";

interface ThemeToggleProps {
  /** Wrapper class (useful for positioning like fixed top-right). */
  className?: string;
  /** Button class. Use `theme-toggle` for the default landing style, or a reset for custom disc-only UIs. */
  buttonClassName?: string;
  /** Disc image class. */
  discClassName?: string;
}

export function ThemeToggle({
  className = "",
  buttonClassName = "theme-toggle",
  discClassName = "theme-toggle__disc",
}: ThemeToggleProps) {
  const { themeId, setThemeId, palettes } = useTheme();
  const popoverId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useFavicon(themeId);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (ev: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (root.contains(ev.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className={`theme-palette ${className}`}>
      <button
        type="button"
        aria-label="Change interface color"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popoverId}
        className={buttonClassName}
        onClick={() => setOpen((v) => !v)}
      >
        <img alt="" src={getDiscMarkDataUrl(themeId)} className={discClassName} />
      </button>

      {open ? (
        <div id={popoverId} role="dialog" aria-label="Color palette" className="theme-palette__popover">
          <div className="theme-palette__grid" role="list">
            {palettes.map((p) => (
              <button
                key={p.id}
                type="button"
                role="listitem"
                className={`theme-palette__swatch ${p.id === themeId ? "theme-palette__swatch--active" : ""}`}
                style={{ ["--swatch" as any]: p.swatch }}
                onClick={() => {
                  setThemeId(p.id);
                  setOpen(false);
                }}
                aria-label={`Theme ${p.label}`}
                title={p.label}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
