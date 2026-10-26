import { describe, expect, it } from "vitest";
import { evaluateRateLimit, readRateLimitConfig } from "../../api/_modules/rateLimit/domain/rateLimit";
import { InMemoryRateLimiter } from "../../api/_modules/rateLimit/infrastructure/inMemoryRateLimiter";
import { RateLimitError } from "../../api/_modules/chat/domain/chat.errors";

describe("evaluateRateLimit", () => {
  const config = { perMinute: 2, perDay: 3 };

  it("allows requests until the per-minute limit and reports when to retry", () => {
    let state;
    const t0 = 1_000_000;
    for (let i = 0; i < 2; i++) {
      const decision = evaluateRateLimit(state, t0 + i * 1000, config);
      expect(decision.allowed).toBe(true);
      if (decision.allowed) state = decision.state;
    }

    const blocked = evaluateRateLimit(state, t0 + 10_000, config);
    expect(blocked).toEqual({ allowed: false, reason: "minute", retryAfterSeconds: 50 });

    const afterWindow = evaluateRateLimit(state, t0 + 60_000, config);
    expect(afterWindow.allowed).toBe(true);
  });

  it("enforces the daily limit across minute windows", () => {
    let state;
    const t0 = 0;
    for (let i = 0; i < 3; i++) {
      const decision = evaluateRateLimit(state, t0 + i * 61_000, config);
      expect(decision.allowed).toBe(true);
      if (decision.allowed) state = decision.state;
    }
    const blocked = evaluateRateLimit(state, t0 + 10 * 61_000, config);
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.reason).toBe("day");
      expect(blocked.retryAfterSeconds).toBe(24 * 3600 - 610);
    }
    expect(evaluateRateLimit(state, t0 + 24 * 3600_000, config).allowed).toBe(true);
  });

  it("reads limits from env with sane fallbacks", () => {
    expect(readRateLimitConfig({ CHAT_RATE_LIMIT_PER_MINUTE: "5", CHAT_RATE_LIMIT_PER_DAY: "50" })).toEqual({ perMinute: 5, perDay: 50 });
    expect(readRateLimitConfig({ CHAT_RATE_LIMIT_PER_MINUTE: "-1", CHAT_RATE_LIMIT_PER_DAY: "abc" })).toEqual({ perMinute: 10, perDay: 200 });
  });
});

describe("InMemoryRateLimiter", () => {
  it("tracks users independently and throws RateLimitError", async () => {
    const limiter = new InMemoryRateLimiter({ perMinute: 1, perDay: 10 }, () => 0);
    await limiter.consume("a");
    await limiter.consume("b");
    await expect(limiter.consume("a")).rejects.toBeInstanceOf(RateLimitError);
    await expect(limiter.consume("a")).rejects.toMatchObject({ retryAfterSeconds: 60 });
  });
});
