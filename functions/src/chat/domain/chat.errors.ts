export class ChatValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatValidationError";
  }
}

export class ProviderConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderConfigurationError";
  }
}

export class ProviderRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderRequestError";
  }
}

export class RateLimitError extends Error {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    const minutes = Math.ceil(retryAfterSeconds / 60);
    super(`Se acabaron las peticiones de hoy. Volvé a intentarlo en ${minutes} minuto${minutes !== 1 ? "s" : ""}.`);
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
