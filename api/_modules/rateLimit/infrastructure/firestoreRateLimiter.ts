import type { Firestore } from "firebase-admin/firestore";
import {
  evaluateRateLimit,
  rateLimitErrorFor,
  type RateLimitConfig,
  type RateLimiter,
  type RateLimitState,
} from "../domain/rateLimit.js";

export class FirestoreRateLimiter implements RateLimiter {
  private readonly db: Firestore;
  private readonly config: RateLimitConfig;
  private readonly now: () => number;

  constructor(db: Firestore, config: RateLimitConfig, now: () => number = Date.now) {
    this.db = db;
    this.config = config;
    this.now = now;
  }

  async consume(uid: string): Promise<void> {
    const ref = this.db.collection("rateLimits").doc(uid);

    const decision = await this.db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const result = evaluateRateLimit(snap.data() as RateLimitState | undefined, this.now(), this.config);
      if (result.allowed) tx.set(ref, result.state);
      return result;
    });

    if (!decision.allowed) throw rateLimitErrorFor(decision);
  }
}
