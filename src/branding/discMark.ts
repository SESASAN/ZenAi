import type { ThemeId } from "@/theme/palettes";

function toDataUrl(svg: string) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

type DiscColors = {
  glow1: string;
  glow2: string;
  ring1: string;
  ring2: string;
  ring3: string;
  strokeSoft: string;
};

const DISC_COLORS: Record<ThemeId, DiscColors> = {
  neon: {
    glow1: "#00E5FF",
    glow2: "#00BFFF",
    ring1: "#8AF7FF",
    ring2: "#00E5FF",
    ring3: "#009DFF",
    strokeSoft: "#38E8FF",
  },
  sunset: {
    glow1: "#FF8C00",
    glow2: "#FF6A00",
    ring1: "#FFD199",
    ring2: "#FF9B42",
    ring3: "#FF6A00",
    strokeSoft: "#FFB347",
  },
  violet: {
    glow1: "#8B5CF6",
    glow2: "#A78BFA",
    ring1: "#DDD6FE",
    ring2: "#A78BFA",
    ring3: "#8B5CF6",
    strokeSoft: "#C4B5FD",
  },
  emerald: {
    glow1: "#22C55E",
    glow2: "#16A34A",
    ring1: "#BBF7D0",
    ring2: "#22C55E",
    ring3: "#16A34A",
    strokeSoft: "#86EFAC",
  },
  red: {
    glow1: "#EF4444",
    glow2: "#F97316",
    ring1: "#FECACA",
    ring2: "#EF4444",
    ring3: "#DC2626",
    strokeSoft: "#FB7185",
  },
  yellow: {
    glow1: "#FBBF24",
    glow2: "#F59E0B",
    ring1: "#FEF3C7",
    ring2: "#FBBF24",
    ring3: "#F59E0B",
    strokeSoft: "#FCD34D",
  },
  white: {
    glow1: "#E5E7EB",
    glow2: "#CBD5E1",
    ring1: "#F1F5F9",
    ring2: "#E5E7EB",
    ring3: "#94A3B8",
    strokeSoft: "#E2E8F0",
  },
};

function discSvg(themeId: ThemeId) {
  const c = DISC_COLORS[themeId];

  // A simplified and themeable version of disc.svg (keeps the same “disc” idea,
  // but avoids hardcoded blues so every palette can recolor it).
  return `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${c.glow1}" stop-opacity="0.22" />
      <stop offset="55%" stop-color="${c.glow2}" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#00131F" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="ringGradient" x1="64" y1="64" x2="448" y2="448">
      <stop offset="0%" stop-color="${c.ring1}" />
      <stop offset="45%" stop-color="${c.ring2}" />
      <stop offset="100%" stop-color="${c.ring3}" />
    </linearGradient>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="strongGlow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <circle cx="256" cy="256" r="220" fill="url(#bgGlow)" />

  <circle cx="256" cy="256" r="176" stroke="url(#ringGradient)" stroke-width="18" filter="url(#strongGlow)" />
  <circle cx="256" cy="256" r="146" stroke="${c.strokeSoft}" stroke-opacity="0.8" stroke-width="6" filter="url(#softGlow)" />

  <circle cx="256" cy="256" r="104" stroke="${c.ring2}" stroke-opacity="0.22" stroke-width="2" />
  <circle cx="256" cy="256" r="116" stroke="${c.ring2}" stroke-opacity="0.14" stroke-width="2" />

  <circle cx="256" cy="256" r="58" fill="none" stroke="${c.ring1}" stroke-opacity="0.85" stroke-width="5" filter="url(#softGlow)" />
  <circle cx="256" cy="256" r="82" stroke="${c.ring2}" stroke-opacity="0.8" stroke-width="4" stroke-dasharray="18 10" filter="url(#softGlow)" />
</svg>
`;
}

export function getDiscMarkDataUrl(themeId: ThemeId) {
  return toDataUrl(discSvg(themeId));
}
