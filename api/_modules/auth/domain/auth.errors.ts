export class AuthRequiredError extends Error {
  constructor() {
    super("You need to sign in to use the chat.");
    this.name = "AuthRequiredError";
  }
}

export class InvalidTokenError extends Error {
  constructor() {
    super("Your session is invalid or has expired. Please sign in again.");
    this.name = "InvalidTokenError";
  }
}
