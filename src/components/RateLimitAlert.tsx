import { useEffect, useState } from "react"

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

export function RateLimitAlert({ message, retryAfterSeconds, onDismiss }: RateLimitAlertProps) {
  const [remaining, setRemaining] = useState(retryAfterSeconds)

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onDismiss()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [onDismiss])

  return (
    <div className="rateLimitAlert" role="alert">
      <span className="rateLimitAlert__message">{message}</span>
      <span className="rateLimitAlert__timer">⏱ {formatTime(remaining)}</span>
    </div>
  )
}