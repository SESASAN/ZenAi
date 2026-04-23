import type { ThemeId } from "@/theme/palettes";

function toDataUrl(svg: string) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Single source of truth for the ZenAI "Z" mark used in:
// - Dynamic favicon (useFavicon)
// - Landing brand icon (LandingPage)
//
// Themeable across a FIXED set of palette ids (no arbitrary colors).
type MarkColors = {
  bg: string;
  border: string;
  innerBg: string;
  innerBorder: string;
  zStroke: string;
  g1: string;
  g2: string;
  g3: string;
};

const MARK_COLORS: Record<ThemeId, MarkColors> = {
  neon: {
    bg: "#0A1628",
    border: "#2563EB",
    innerBg: "#070D18",
    innerBorder: "#22D3EE",
    zStroke: "#67E8F9",
    g1: "#67E8F9",
    g2: "#38BDF8",
    g3: "#2563EB",
  },
  sunset: {
    bg: "#1F120A",
    border: "#FF6A00",
    innerBg: "#1A0F08",
    innerBorder: "#FF9B42",
    zStroke: "#FF9B42",
    g1: "#FF9B42",
    g2: "#FF6A00",
    g3: "#FF6A00",
  },
  violet: {
    bg: "#120b22",
    border: "#8B5CF6",
    innerBg: "#0b0716",
    innerBorder: "#A78BFA",
    zStroke: "#DDD6FE",
    g1: "#DDD6FE",
    g2: "#A78BFA",
    g3: "#8B5CF6",
  },
  emerald: {
    bg: "#071a12",
    border: "#16A34A",
    innerBg: "#06110c",
    innerBorder: "#22C55E",
    zStroke: "#BBF7D0",
    g1: "#BBF7D0",
    g2: "#22C55E",
    g3: "#16A34A",
  },
  red: {
    bg: "#1b0a0a",
    border: "#DC2626",
    innerBg: "#120606",
    innerBorder: "#EF4444",
    zStroke: "#FECACA",
    g1: "#FECACA",
    g2: "#FB7185",
    g3: "#DC2626",
  },
  yellow: {
    bg: "#1a1407",
    border: "#F59E0B",
    innerBg: "#110e06",
    innerBorder: "#FBBF24",
    zStroke: "#FEF3C7",
    g1: "#FEF3C7",
    g2: "#FCD34D",
    g3: "#F59E0B",
  },
  white: {
    bg: "#0b111b",
    border: "#CBD5E1",
    innerBg: "#070d18",
    innerBorder: "#E2E8F0",
    zStroke: "#E5E7EB",
    g1: "#F1F5F9",
    g2: "#E5E7EB",
    g3: "#94A3B8",
  },
};

function buildMarkSvg(themeId: ThemeId) {
  const c = MARK_COLORS[themeId];
  return `
<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="z_gradient" x1="96" y1="96" x2="160" y2="160" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${c.g1}"/>
      <stop offset="50%" stop-color="${c.g2}"/>
      <stop offset="100%" stop-color="${c.g3}"/>
    </linearGradient>
  </defs>
  <rect x="28" y="28" width="200" height="200" rx="40" fill="${c.bg}"/>
  <rect x="30" y="30" width="196" height="196" rx="38" stroke="${c.border}" stroke-opacity="0.3"/>
  <rect x="76" y="76" width="104" height="104" rx="10" fill="${c.innerBg}" stroke="${c.innerBorder}" stroke-opacity="0.2"/>
  <path d="M96 96H160V104L106 152H160V160H96V152L150 104H96V96Z" fill="url(#z_gradient)" stroke="${c.zStroke}" stroke-width="0.5" stroke-linejoin="round"/>
</svg>
`;
}

export function getZenaiMarkSvg(themeId: ThemeId) {
  return buildMarkSvg(themeId);
}

export function getZenaiMarkDataUrl(themeId: ThemeId) {
  return toDataUrl(getZenaiMarkSvg(themeId));
}
