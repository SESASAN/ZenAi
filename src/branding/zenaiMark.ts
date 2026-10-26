import { getAccent, type ThemeId } from "@/theme/palettes";
import { ENSO_PATH } from "@/components/ui/ZenMark";

function toDataUrl(svg: string) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Favicon: the enso on a graphite tile, in the current accent. */
export function getZenaiMarkSvg(themeId: ThemeId) {
  const accent = getAccent(themeId);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#161618"/><g transform="translate(4 4)"><path d="${ENSO_PATH}" fill="none" stroke="${accent}" stroke-width="2.6" stroke-linecap="round"/></g></svg>`;
}

export function getZenaiMarkDataUrl(themeId: ThemeId) {
  return toDataUrl(getZenaiMarkSvg(themeId));
}
