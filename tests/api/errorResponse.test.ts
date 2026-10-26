import { describe, expect, it, vi } from "vitest";
import { toErrorResponse } from "../../api/_modules/shared/http/errorResponse";
import {
  ChatValidationError,
  NotFoundError,
  ProviderConfigurationError,
  ProviderRequestError,
  RateLimitError,
} from "../../api/_modules/chat/domain/chat.errors";
import { AuthRequiredError, InvalidTokenError } from "../../api/_modules/auth/domain/auth.errors";

describe("toErrorResponse", () => {
  it("maps domain errors to status codes", () => {
    const log = vi.fn();
    expect(toErrorResponse(new RateLimitError(12.2), log)).toEqual({
      status: 429,
      body: { error: expect.any(String), retryAfterSeconds: 13 },
    });
    expect(toErrorResponse(new ChatValidationError("bad"), log)).toEqual({ status: 400, body: { error: "bad" } });
    expect(toErrorResponse(new AuthRequiredError(), log).status).toBe(401);
    expect(toErrorResponse(new InvalidTokenError(), log).status).toBe(401);
    expect(toErrorResponse(new NotFoundError(), log).status).toBe(404);
    expect(toErrorResponse(new ProviderRequestError("x"), log).status).toBe(502);
    expect(toErrorResponse(new ProviderConfigurationError("x"), log).status).toBe(500);
  });

  it("never leaks internal details, but logs them", () => {
    const log = vi.fn();
    const secret = "GROQ_API_KEY=sk-123 stack trace";

    for (const error of [new ProviderRequestError(secret), new ProviderConfigurationError(secret), new Error(secret)]) {
      const response = toErrorResponse(error, log);
      expect(JSON.stringify(response)).not.toContain("sk-123");
    }
    expect(log).toHaveBeenCalledTimes(3);
    expect(JSON.stringify(log.mock.calls)).toContain("sk-123");
  });
});
