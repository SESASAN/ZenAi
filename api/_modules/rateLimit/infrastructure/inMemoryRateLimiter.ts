import {
  evaluateRateLimit,
  rateLimitErrorFor,
  type RateLimitConfig,
  type RateLimiter,
  type RateLimitState,
} from "../domain/rateLimit.js";

/** Process-local limiter (tests and local development). */
export class InMemoryRateLimiter implements RateLimiter {
  private readonly states = new Map<string, RateLimitState>();
  private readonly config: RateLimitConfig;
  private readonly now: () => number;

  constructor(config: RateLimitConfig, now: () => number = Date.now) {
    this.config = config;
    this.now = now;
  }

  async consume(uid: string): Promise<void> {
    const decision = evaluateRateLimit(this.states.get(uid), this.now(), this.config);
    if (!decision.allowed) throw rateLimitErrorFor(decision);
    this.states.set(uid, decision.state);
  }
}
