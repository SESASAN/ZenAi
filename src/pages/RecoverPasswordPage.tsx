import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/services/firebase/useAuth";
import { getAuthErrorMessage } from "@/services/firebase/authErrors";
import { AuthLayout } from "@/components/site/AuthLayout";
import { Icon } from "@/components/ui/Icon";

export function RecoverPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      // Don't reveal whether the account exists.
      const code = typeof err === "object" && err && "code" in err ? String((err as { code: unknown }).code) : "";
      if (code === "auth/user-not-found") setSent(true);
      else setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Link to="/login" className="authPage__back">
        <Icon name="chevronLeft" size={16} />
        Volver a iniciar sesión
      </Link>
      <h1 className="authPage__title">Recupera tu contraseña</h1>
      <p className="authPage__subtitle">Escribe el correo de tu cuenta y te enviaremos un enlace para crear una nueva.</p>

      <form className="authForm" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="recover-email" className="field__label">Correo electrónico</label>
          <input
            className="input"
            id="recover-email"
            autoComplete="email"
            placeholder="tu@correo.com"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSent(false);
            }}
            disabled={isLoading}
            required
          />
        </div>

        {error ? (
          <p className="authForm__error" role="alert">
            <Icon name="alert" size={16} />
            {error}
          </p>
        ) : null}

        <button className="btn btn--primary btn--block" type="submit" disabled={isLoading}>
          {isLoading ? "Enviando…" : sent ? "Enviar de nuevo" : "Enviar enlace"}
        </button>
      </form>

      {sent ? (
        <div className="notice notice--success authPage__notice" role="status">
          <Icon name="check" size={20} className="notice__icon" />
          <span>Si hay una cuenta con ese correo, recibirás el enlace en unos minutos. Revisa también la carpeta de spam.</span>
        </div>
      ) : null}

      <p className="authPage__note">
        ¿Entraste con Google o GitHub? Tu contraseña la gestiona ese servicio; vuelve e inicia sesión con él.
      </p>
    </AuthLayout>
  );
}
