import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/services/firebase/useAuth";
import { getAuthErrorMessage } from "@/services/firebase/authErrors";
import { AuthLayout, SocialButtons } from "@/components/site/AuthLayout";
import { Icon } from "@/components/ui/Icon";

export function LoginPage() {
  const navigate = useNavigate();
  const { user, signIn, signInWithGithub, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate("/chat", { replace: true });
    }
  }, [user, navigate]);

  const run = async (action: () => Promise<void>) => {
    setError(null);
    setIsLoading(true);
    try {
      await action();
      navigate("/chat", { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = (e: FormEvent) => {
    e.preventDefault();
    void run(() => signInWithEmail(email, password));
  };

  return (
    <AuthLayout>
      <h1 className="authPage__title">Inicia sesión</h1>
      <p className="authPage__subtitle">Retoma tus conversaciones donde las dejaste.</p>

      <SocialButtons onGoogle={() => void run(signIn)} onGithub={() => void run(signInWithGithub)} disabled={isLoading} />

      <p className="divider authPage__divider">o con tu correo</p>

      <form className="authForm" onSubmit={handleEmailAuth} noValidate={false}>
        <div className="field">
          <label htmlFor="login-email" className="field__label">Correo electrónico</label>
          <input
            className="input"
            id="login-email"
            autoComplete="email"
            placeholder="tu@correo.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="field">
          <div className="field__row">
            <label htmlFor="login-password" className="field__label">Contraseña</label>
            <Link className="authForm__aside" to="/recuperar">¿La olvidaste?</Link>
          </div>
          <input
            className="input"
            id="login-password"
            autoComplete="current-password"
            placeholder="Mínimo 6 caracteres"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "login-error" : undefined}
            required
            minLength={6}
          />
        </div>

        {error ? (
          <p id="login-error" className="authForm__error" role="alert">
            <Icon name="alert" size={16} />
            {error}
          </p>
        ) : null}

        <button className="btn btn--primary btn--block" type="submit" disabled={isLoading}>
          {isLoading ? "Entrando…" : "Iniciar sesión"}
        </button>
      </form>

      <p className="authPage__switch">
        ¿No tienes cuenta? <Link to="/register">Créala aquí</Link>
      </p>
    </AuthLayout>
  );
}
