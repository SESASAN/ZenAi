import type { SVGProps } from "react"

/** Stroke icons drawn for ZenAI (1.75px, round caps). Decorative by default. */
const PATHS = {
  plus: "M12 5v14M5 12h14",
  search: "M11 4.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM20 20l-4.2-4.2",
  sidebar: "M6.5 4.5h11a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3zM9.5 4.5v15",
  menu: "M4 8h16M4 16h11",
  close: "M6 6l12 12M18 6 6 18",
  settings:
    "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1",
  edit: "M12 20h8M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  trash: "M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13",
  send: "M12 19V5M5.5 11.5 12 5l6.5 6.5",
  chevronDown: "m6 9 6 6 6-6",
  chevronUp: "m6 15 6-6 6 6",
  chevronLeft: "M15 18l-6-6 6-6",
  chevronRight: "m9 6 6 6-6 6",
  check: "m5 12.5 4.5 4.5L19 7.5",
  copy: "M10 8h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zM16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2",
  refresh: "M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5",
  alert: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v5M12 16h.01",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
  lock: "M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2zM8 11V8a4 4 0 0 1 8 0v3",
  wifiOff:
    "M2 8.8a15 15 0 0 1 4.2-2.6M10.7 5.1A15 15 0 0 1 22 8.8M5 12.5a10 10 0 0 1 5.2-2.5M16.8 11.4a10 10 0 0 1 2.2 1.1M8.5 16.1a5 5 0 0 1 7 0M12 20h.01M3 3l18 18",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  external: "M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4",
  logout: "M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4",
  chat: "M20 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z",
  activity: "M4 12h3l2-6 4 12 2-6h5",
  sliders: "M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4",
} as const

export type IconName = keyof typeof PATHS

type IconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: IconName
  size?: number
  strokeWidth?: number
}

export function Icon({ name, size = 18, strokeWidth = 1.75, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
