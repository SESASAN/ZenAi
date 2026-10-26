import { useSyncExternalStore } from "react"

function subscribe(callback: () => void) {
  window.addEventListener("online", callback)
  window.addEventListener("offline", callback)
  return () => {
    window.removeEventListener("online", callback)
    window.removeEventListener("offline", callback)
  }
}

/** Mirrors navigator.onLine; true on the server or when the API is missing. */
export function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => (typeof navigator === "undefined" ? true : navigator.onLine !== false),
    () => true,
  )
}
