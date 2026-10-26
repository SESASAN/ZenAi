import { RateLimitError } from "../../chat/domain/chat.errors.js";

export type RateLimitConfig = {
  perMinute: number;
  perDay: number;
};

export type RateLimitState = {
  minuteWindowStart: number;
  minuteCount: number;
  dayWindowStart: number;
  dayCount: number;
};

export type RateLimitDecision =
  | { allowed: true; state: RateLimitState }
  | { allowed: false; retryAfterSeconds: number; reason: "minute" | "day" };

export interface RateLimiter {
  /** Records one request for `uid`. Throws RateLimitError when the limit is exceeded. */
  consume(uid: string): Promise<void>;
}

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * 60_000;

export const DEFAULT_RATE_LIMIT: RateLimitConfig = { perMinute: 10, perDay: 200 };

function readPositiveInt(value: string | undefined, fallback: number) {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function readRateLimitConfig(env: Record<string, string | undefined> = process.env): RateLimitConfig {
  return {
    perMinute: readPositiveInt(env.CHAT_RATE_LIMIT_PER_MINUTE, DEFAULT_RATE_LIMIT.perMinute),
    perDay: readPositiveInt(env.CHAT_RATE_LIMIT_PER_DAY, DEFAULT_RATE_LIMIT.perDay),
  };
}

/** Pure fixed-window evaluation (1 minute + 24 hours). */
export function evaluateRateLimit(
  previous: RateLimitState | undefined,
  now: number,
  config: RateLimitConfig,
): RateLimitDecision {
  const state: RateLimitState = previous
    ? { ...previous }
    : { minuteWindowStart: now, minuteCount: 0, dayWindowStart: now, dayCount: 0 };

  if (now - state.minuteWindowStart >= MINUTE_MS) {
    state.minuteWindowStart = now;
    state.minuteCount = 0;
  }
  if (now - state.dayWindowStart >= DAY_MS) {
    state.dayWindowStart = now;
    state.dayCount = 0;
  }

  if (state.dayCount >= config.perDay) {
    return {
      allowed: false,
      reason: "day",
      retryAfterSeconds: Math.ceil((state.dayWindowStart + DAY_MS - now) / 1000),
    };
  }
  if (state.minuteCount >= config.perMinute) {
    return {
      allowed: false,
      reason: "minute",
      retryAfterSeconds: Math.ceil((state.minuteWindowStart + MINUTE_MS - now) / 1000),
    };
  }

  state.minuteCount += 1;
  state.dayCount += 1;
  return { allowed: true, state };
}

export function rateLimitErrorFor(decision: Extract<RateLimitDecision, { allowed: false }>) {
  return new RateLimitError(
    decision.retryAfterSeconds,
    decision.reason === "day"
      ? "You've reached today's message limit. Please come back later."
      : "You're sending messages too fast. Please wait a moment.",
  );
}
