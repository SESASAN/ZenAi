/** The open enso that marks ZenAI. Uses the current accent unless a color is passed. */
export const ENSO_PATH = "M17.8 5.6A8.5 8.5 0 1 0 20.4 13"

export function ZenMark({
  size = 22,
  strokeWidth = 2.4,
  color = "var(--accent)",
  className,
}: {
  size?: number
  strokeWidth?: number
  color?: string
  className?: string
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={ENSO_PATH} />
    </svg>
  )
}

/** Logo: enso + wordmark. */
export function ZenLogo({ size = 22 }: { size?: number }) {
  return (
    <span className="zenLogo">
      <ZenMark size={size} />
      <span>ZenAI</span>
    </span>
  )
}
