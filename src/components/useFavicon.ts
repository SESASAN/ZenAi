import { useEffect } from "react";
import { getZenaiMarkDataUrl } from "@/branding/zenaiMark";

const FAVICON_LINK_ID = "zenai-dynamic-favicon";

export function useFavicon(isAltTheme: boolean) {
  useEffect(() => {
    const dataUrl = getZenaiMarkDataUrl(isAltTheme);
    
    let faviconLink = document.getElementById(FAVICON_LINK_ID) as HTMLLinkElement | null;
    if (!faviconLink) {
      faviconLink = document.createElement("link");
      faviconLink.id = FAVICON_LINK_ID;
      faviconLink.rel = "icon";
      faviconLink.type = "image/svg+xml";
      document.head.appendChild(faviconLink);
    }
    faviconLink.href = dataUrl;
  }, [isAltTheme]);
}
