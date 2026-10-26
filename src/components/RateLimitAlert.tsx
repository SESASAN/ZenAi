import { useEffect, useRef, useState } from "react"
import { Icon } from "@/components/ui/Icon"

interface RateLimitAlertProps {
  message: string
  retryAfterSeconds: number
  onDismiss: () => void
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0) {
    return `${h}h ${m}m ${s}s`
  }
  if (m > 0) {
    return `${m}m ${s}s`
  }
  return `${s}s`
}

/**
 * Countdown based on a fixed deadline, so parent re-renders (e.g. while streaming)
 * don't reset the timer. Remount it with a new `key` for a new limit.
 */
export function RateLimitAlert({ message, retryAfterSeconds, onDismiss }: RateLimitAlertProps) {
  const [deadline] = useState(() => Date.now() + retryAfterSeconds * 1000)
  const [remaining, setRemaining] = useState(retryAfterSeconds)
  const onDismissRef = useRef(onDismiss)

  useEffect(() => {
    onDismissRef.current = onDismiss
  }, [onDismiss])

  useEffect(() => {
    const interval = setInterval(() => {
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setRemaining(next)
      if (next === 0) {
        clearInterval(interval)
        onDismissRef.current()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [deadline])

  const progress = retryAfterSeconds > 0 ? Math.min(100, ((retryAfterSeconds - remaining) / retryAfterSeconds) * 100) : 100

  return (
    <div className="chatAlert chatAlert--warning" role="alert">
      <Icon name="clock" size={20} className="chatAlert__icon" />
      <div className="chatAlert__body">
        <strong className="chatAlert__title">Demasiadas solicitudes</strong>
        <span className="chatAlert__text">
          {message} Podrás enviar de nuevo en{" "}
          <strong className="chatAlert__timer">{formatTime(remaining)}</strong>. Tu texto se queda en el campo de escritura.
        </span>
        <span className="chatAlert__progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </span>
      </div>
    </div>
  )
}
