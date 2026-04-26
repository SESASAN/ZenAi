import { useEffect, useRef } from "react"

import { useTheme } from "@/components/ThemeContext"

type Rgb = { r: number; g: number; b: number }

type TrailPoint = { x: number; y: number; life: number }

type Direction = 0 | 1 | 2 | 3

type Cycle = {
  x: number
  y: number
  dir: Direction
  speed: number
  turnIn: number
  points: TrailPoint[]
  lastPx: number
  lastPy: number
  sinceLastPoint: number
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function parseCssColorToRgb(raw: string): Rgb | null {
  const value = raw.trim()
  if (!value) return null

  // Hex: #rgb or #rrggbb
  if (value.startsWith("#")) {
    const hex = value.slice(1)
    if (hex.length === 3) {
      const r = Number.parseInt(hex[0] + hex[0], 16)
      const g = Number.parseInt(hex[1] + hex[1], 16)
      const b = Number.parseInt(hex[2] + hex[2], 16)
      if ([r, g, b].some((c) => Number.isNaN(c))) return null
      return { r, g, b }
    }
    if (hex.length === 6) {
      const r = Number.parseInt(hex.slice(0, 2), 16)
      const g = Number.parseInt(hex.slice(2, 4), 16)
      const b = Number.parseInt(hex.slice(4, 6), 16)
      if ([r, g, b].some((c) => Number.isNaN(c))) return null
      return { r, g, b }
    }
  }

  // rgb(...) / rgba(...)
  const rgbMatch = value.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([.\d]+))?\s*\)$/i
  )
  if (rgbMatch) {
    const r = clamp(Number(rgbMatch[1]), 0, 255)
    const g = clamp(Number(rgbMatch[2]), 0, 255)
    const b = clamp(Number(rgbMatch[3]), 0, 255)
    return { r, g, b }
  }

  return null
}

function dirVec(dir: Direction) {
  switch (dir) {
    case 0:
      return { dx: 1, dy: 0 }
    case 1:
      return { dx: 0, dy: 1 }
    case 2:
      return { dx: -1, dy: 0 }
    case 3:
      return { dx: 0, dy: -1 }
  }
}

function turnLeft(dir: Direction): Direction {
  return ((dir + 3) % 4) as Direction
}

function turnRight(dir: Direction): Direction {
  return ((dir + 1) % 4) as Direction
}

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

export function NeonLinesBackground({ className = "" }: { className?: string }) {
  const { themeId, palettes } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  // Smooth theme transitions: keep a current color that lerps toward a target color.
  const currentColorRef = useRef<Rgb>({ r: 0, g: 229, b: 255 })
  const targetColorRef = useRef<Rgb>({ r: 0, g: 229, b: 255 })

  useEffect(() => {
    if (typeof window === "undefined") return

    // Prefer deriving the color from the active palette directly. Reading CSS vars
    // right after theme changes can race with the ThemeProvider effect that updates
    // `data-theme`, making the canvas keep the previous color.
    const swatch = palettes.find((p) => p.id === themeId)?.swatch
    const fromSwatch = swatch ? parseCssColorToRgb(swatch) : null
    if (fromSwatch) {
      targetColorRef.current = fromSwatch
      return
    }

    // Fallback: read from CSS var (best-effort).
    const css = getComputedStyle(document.documentElement)
    const neon = css.getPropertyValue("--neon-primary")
    const parsed = parseCssColorToRgb(neon)
    if (parsed) targetColorRef.current = parsed
  }, [themeId])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
    if (prefersReducedMotion) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1

    const cycles: Cycle[] = []

    const spawnCycle = (w: number, h: number): Cycle => {
      const margin = 48
      const side = pick<"top" | "right" | "bottom" | "left">(["top", "right", "bottom", "left"])
      const speed = randBetween(220, 420)
      const points: TrailPoint[] = []

      let x = 0
      let y = 0
      let dir: Direction = 0

      if (side === "top") {
        x = randBetween(margin, w - margin)
        y = margin
        dir = 1
      } else if (side === "right") {
        x = w - margin
        y = randBetween(margin, h - margin)
        dir = 2
      } else if (side === "bottom") {
        x = randBetween(margin, w - margin)
        y = h - margin
        dir = 3
      } else {
        x = margin
        y = randBetween(margin, h - margin)
        dir = 0
      }

      points.push({ x, y, life: 1 })

      return {
        x,
        y,
        dir,
        speed,
        turnIn: randBetween(120, 360),
        points,
        lastPx: x,
        lastPy: y,
        sinceLastPoint: 0,
      }
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = Math.max(1, Math.floor(rect.width))
      height = Math.max(1, Math.floor(rect.height))
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Re-seed cycles to match new size.
      cycles.length = 0
      const count = width < 520 ? 4 : 7
      for (let i = 0; i < count; i++) cycles.push(spawnCycle(width, height))
    }

    resize()
    const ro = new ResizeObserver(() => resize())
    ro.observe(canvas)

    let raf = 0
    let last = performance.now()

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      ctx.clearRect(0, 0, width, height)

      // Smoothly transition color toward the active theme.
      const tc = targetColorRef.current
      const cc = currentColorRef.current
      const t = 1 - Math.exp(-dt * 7.5) // ~250-350ms to settle
      cc.r += (tc.r - cc.r) * t
      cc.g += (tc.g - cc.g) * t
      cc.b += (tc.b - cc.b) * t

      // A faint “grid haze” helps sell the neon sci-fi vibe without stealing focus.
      const r = Math.round(cc.r)
      const g = Math.round(cc.g)
      const b = Math.round(cc.b)
      ctx.save()
      ctx.globalAlpha = 0.08
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 1)`
      ctx.lineWidth = 1
      const grid = 72
      for (let x = 0; x <= width; x += grid) {
        ctx.beginPath()
        ctx.moveTo(x + 0.5, 0)
        ctx.lineTo(x + 0.5, height)
        ctx.stroke()
      }
      for (let y = 0; y <= height; y += grid) {
        ctx.beginPath()
        ctx.moveTo(0, y + 0.5)
        ctx.lineTo(width, y + 0.5)
        ctx.stroke()
      }
      ctx.restore()

      const margin = 48
      const pointSpacing = 9
      const trailSeconds = 1.35

      for (const c of cycles) {
        // Move
        const { dx, dy } = dirVec(c.dir)
        const dist = c.speed * dt
        c.x += dx * dist
        c.y += dy * dist

        // Boundary steering (keeps bikes in-bounds without hard “bounces”)
        if (c.x < margin) c.dir = 0
        else if (c.x > width - margin) c.dir = 2
        if (c.y < margin) c.dir = 1
        else if (c.y > height - margin) c.dir = 3

        // Turns (left/right) at random intervals
        c.turnIn -= dist
        if (c.turnIn <= 0) {
          c.dir = Math.random() < 0.5 ? turnLeft(c.dir) : turnRight(c.dir)
          c.turnIn = randBetween(120, 360)
        }

        // Trail points
        const dxp = c.x - c.lastPx
        const dyp = c.y - c.lastPy
        c.sinceLastPoint += Math.hypot(dxp, dyp)
        c.lastPx = c.x
        c.lastPy = c.y

        if (c.sinceLastPoint >= pointSpacing) {
          c.points.push({ x: c.x, y: c.y, life: 1 })
          c.sinceLastPoint = 0
        }

        // Age points
        const decay = dt / trailSeconds
        for (const p of c.points) p.life -= decay
        while (c.points.length && c.points[0]!.life <= 0) c.points.shift()

        // Draw
        if (c.points.length < 2) continue

        ctx.save()
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.globalCompositeOperation = "lighter"

        // Glow pass
        ctx.shadowBlur = 18
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.9)`
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.16)`
        ctx.lineWidth = 7
        ctx.beginPath()
        ctx.moveTo(c.points[0]!.x, c.points[0]!.y)
        for (let i = 1; i < c.points.length; i++) ctx.lineTo(c.points[i]!.x, c.points[i]!.y)
        ctx.stroke()

        // Core pass
        ctx.shadowBlur = 0
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.75)`
        ctx.lineWidth = 2.4
        ctx.beginPath()
        ctx.moveTo(c.points[0]!.x, c.points[0]!.y)
        for (let i = 1; i < c.points.length; i++) ctx.lineTo(c.points[i]!.x, c.points[i]!.y)
        ctx.stroke()

        // Head dot
        const head = c.points[c.points.length - 1]!
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.95)`
        ctx.beginPath()
        ctx.arc(head.x, head.y, 2.6, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
      }

      raf = window.requestAnimationFrame(tick)
    }

    raf = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [themeId])

  return (
    <div className={`landing-neon-lines-bg ${className}`.trim()} aria-hidden="true">
      <canvas ref={canvasRef} className="landing-neon-lines-bg__canvas" />
    </div>
  )
}
