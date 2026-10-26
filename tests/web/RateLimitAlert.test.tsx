// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, render, screen } from "@testing-library/react"
import { RateLimitAlert } from "@/components/RateLimitAlert"

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe("RateLimitAlert", () => {
  it("counts down without resetting on parent re-renders, then dismisses itself", () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    const { rerender } = render(<RateLimitAlert message="Wait" retryAfterSeconds={65} onDismiss={onDismiss} />)
    expect(screen.getByRole("alert").textContent).toContain("1m 5s")

    // Frequent parent re-renders (e.g. while a reply streams) used to restart the interval and freeze the timer.
    for (let i = 0; i < 10; i++) {
      act(() => vi.advanceTimersByTime(500))
      rerender(<RateLimitAlert message="Wait" retryAfterSeconds={65} onDismiss={() => onDismiss()} />)
    }
    expect(screen.getByRole("alert").textContent).toContain("1m 0s")

    act(() => vi.advanceTimersByTime(60_000))
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("alert").textContent).toContain("0s")
  })
})
