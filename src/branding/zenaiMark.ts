function toDataUrl(svg: string) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Single source of truth for the ZenAI "Z" mark used in:
// - Dynamic favicon (useFavicon)
// - Landing brand icon (LandingPage)
//
// This prevents “almost the same orange” issues when someone tweaks one but not the other.
const NEON_MARK_SVG = `
<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="z_gradient" x1="96" y1="96" x2="160" y2="160" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#67E8F9"/>
      <stop offset="50%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
  </defs>
  <rect x="28" y="28" width="200" height="200" rx="40" fill="#0A1628"/>
  <rect x="30" y="30" width="196" height="196" rx="38" stroke="#2563EB" stroke-opacity="0.3"/>
  <rect x="76" y="76" width="104" height="104" rx="10" fill="#070D18" stroke="#22D3EE" stroke-opacity="0.2"/>
  <path d="M96 96H160V104L106 152H160V160H96V152L150 104H96V96Z" fill="url(#z_gradient)" stroke="#67E8F9" stroke-width="0.5" stroke-linejoin="round"/>
</svg>
`;

const SUNSET_MARK_SVG = `
<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="z_gradient" x1="96" y1="96" x2="160" y2="160" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FF9B42"/>
      <stop offset="50%" stop-color="#FF6A00"/>
      <stop offset="100%" stop-color="#FF6A00"/>
    </linearGradient>
  </defs>
  <rect x="28" y="28" width="200" height="200" rx="40" fill="#1F120A"/>
  <rect x="30" y="30" width="196" height="196" rx="38" stroke="#FF6A00" stroke-opacity="0.3"/>
  <rect x="76" y="76" width="104" height="104" rx="10" fill="#1A0F08" stroke="#FF9B42" stroke-opacity="0.2"/>
  <path d="M96 96H160V104L106 152H160V160H96V152L150 104H96V96Z" fill="url(#z_gradient)" stroke="#FF9B42" stroke-width="0.5" stroke-linejoin="round"/>
</svg>
`;

export function getZenaiMarkSvg(isAltTheme: boolean) {
  return isAltTheme ? SUNSET_MARK_SVG : NEON_MARK_SVG;
}

export function getZenaiMarkDataUrl(isAltTheme: boolean) {
  return toDataUrl(getZenaiMarkSvg(isAltTheme));
}

