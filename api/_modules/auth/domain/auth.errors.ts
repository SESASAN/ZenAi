export class AuthRequiredError extends Error {
  constructor() {
    super("Necesitás iniciar sesión para usar el chat.");
    this.name = "AuthRequiredError";
  }
}

export class InvalidTokenError extends Error {
  constructor() {
    super("Token inválido o expirado.");
    this.name = "InvalidTokenError";
  }
}

