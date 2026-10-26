/** Maps Firebase Auth error codes to short Spanish messages for the forms. */
const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "El correo o la contraseña no son correctos.",
  "auth/wrong-password": "El correo o la contraseña no son correctos.",
  "auth/user-not-found": "El correo o la contraseña no son correctos.",
  "auth/invalid-email": "Ese correo no parece válido.",
  "auth/missing-email": "Escribe tu correo.",
  "auth/email-already-in-use": "Ya existe una cuenta con ese correo. Inicia sesión.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/too-many-requests": "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.",
  "auth/network-request-failed": "Sin conexión a internet. Revisa tu red y vuelve a intentarlo.",
  "auth/popup-closed-by-user": "Cerraste la ventana antes de terminar. Inténtalo de nuevo.",
  "auth/cancelled-popup-request": "Cerraste la ventana antes de terminar. Inténtalo de nuevo.",
  "auth/popup-blocked": "El navegador bloqueó la ventana de inicio de sesión. Permite las ventanas emergentes.",
  "auth/account-exists-with-different-credential":
    "Ese correo ya está registrado con otro método. Entra con el método que usaste la primera vez.",
  "auth/requires-recent-login": "Por seguridad, cierra sesión y vuelve a entrar antes de hacer esto.",
  "auth/user-disabled": "Esta cuenta está desactivada.",
}

export function getAuthErrorMessage(error: unknown, fallback = "No pudimos completar la acción. Inténtalo de nuevo.") {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code: unknown }).code) : ""
  return MESSAGES[code] ?? fallback
}
