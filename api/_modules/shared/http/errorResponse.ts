import { AuthRequiredError, InvalidTokenError } from "../../auth/domain/auth.errors.js";
import {
  ChatValidationError,
  NotFoundError,
  ProviderConfigurationError,
  ProviderRequestError,
  RateLimitError,
} from "../../chat/domain/chat.errors.js";

export type ErrorResponse = {
  status: number;
  body: { error: string; retryAfterSeconds?: number };
};

/** Maps domain errors to HTTP responses without leaking internal details to the client. */
export function toErrorResponse(error: unknown, log: (...args: unknown[]) => void = console.error): ErrorResponse {
  if (error instanceof RateLimitError) {
    return { status: 429, body: { error: error.message, retryAfterSeconds: error.retryAfterSeconds } };
  }
  if (error instanceof ChatValidationError) {
    return { status: 400, body: { error: error.message } };
  }
  if (error instanceof AuthRequiredError || error instanceof InvalidTokenError) {
    return { status: 401, body: { error: error.message } };
  }
  if (error instanceof NotFoundError) {
    return { status: 404, body: { error: error.message } };
  }
  if (error instanceof ProviderRequestError) {
    log("[zenai] provider error:", error.detail);
    return { status: 502, body: { error: error.message } };
  }
  if (error instanceof ProviderConfigurationError) {
    log("[zenai] configuration error:", error.detail);
    return { status: 500, body: { error: error.message } };
  }

  log("[zenai] unexpected error:", error);
  return { status: 500, body: { error: "Something went wrong on our side. Please try again." } };
}
