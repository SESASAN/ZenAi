export class ChatValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "Not found.") {
    super(message);
    this.name = "NotFoundError";
  }
}

/** `message` is safe to show to users; `detail` is only logged. */
export class ProviderConfigurationError extends Error {
  readonly detail: string;

  constructor(detail: string) {
    super("The chat service is not configured correctly. Please try again later.");
    this.name = "ProviderConfigurationError";
    this.detail = detail;
  }
}

/** `message` is safe to show to users; `detail` is only logged. */
export class ProviderRequestError extends Error {
  readonly detail: string;

  constructor(detail: string) {
    super("The AI provider couldn't generate a response. Please try again.");
    this.name = "ProviderRequestError";
    this.detail = detail;
  }
}

export class RateLimitError extends Error {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number, message = "Too many requests. Please wait a moment and try again.") {
    super(message);
    this.name = "RateLimitError";
    this.retryAfterSeconds = Math.max(1, Math.ceil(retryAfterSeconds));
  }
}
