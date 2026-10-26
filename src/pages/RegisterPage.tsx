import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/services/firebase/useAuth";
import { getAuthErrorMessage } from "@/services/firebase/authErrors";
import { AuthLayout, SocialButtons } from "@/components/site/AuthLayout";
import { Icon } from "@/components/ui/Icon";

type FieldErrors = { password?: string; confirm?: string };

export function RegisterPage() {
  const navigate = useNavigate();
  const { user, signIn, signInWithGithub, signUpWithEmail } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: FieldErrors = {};
    if (password.length < 6) nextErrors.password = "Debe tener al menos 6 caracteres.";
    if (password !== confirmPassword) nextErrors.confirm = "Las contraseñas no coinciden.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    void run(() => signUpWithEmail(email, password, fullName.trim() || undefined));
  };

  return (
    <AuthLayout>
      <h1 className="authPage__title">Crea tu cuenta</h1>
      <p className="authPage__subtitle">Tus conversaciones quedarán guardadas en ella.</p>

      <SocialButtons compact onGoogle={() => void run(signIn)} onGithub={() => void run(signInWithGithub)} disabled={isLoading} />

      <p className="divider authPage__divider">o con tu correo</p>

      <form className="authForm" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="register-name" className="field__label">Nombre</label>
          <input
            className="input"
            id="register-name"
            autoComplete="name"
            placeholder="Cómo quieres que te llamemos"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="field">
          <label htmlFor="register-email" className="field__label">Correo electrónico</label>
          <input
            className="input"
            id="register-email"
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
          <label htmlFor="register-password" className="field__label">Contraseña</label>
          <input
            className="input"
            id="register-password"
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            aria-invalid={fieldErrors.password ? true : undefined}
            aria-describedby="register-password-hint"
            required
          />
          {fieldErrors.password ? (
            <p id="register-password-hint" className="field__error"><Icon name="alert" size={14} />{fieldErrors.password}</p>
          ) : (
            <p id="register-password-hint" className="field__hint">Mínimo 6 caracteres.</p>
          )}
        </div>

        <div className="field">
          <label htmlFor="register-confirm" className="field__label">Confirma la contraseña</label>
          <input
            className="input"
            id="register-confirm"
            autoComplete="new-password"
            placeholder="Repítela"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            aria-invalid={fieldErrors.confirm ? true : undefined}
            aria-describedby={fieldErrors.confirm ? "register-confirm-error" : undefined}
            required
          />
          {fieldErrors.confirm ? (
            <p id="register-confirm-error" className="field__error"><Icon name="alert" size={14} />{fieldErrors.confirm}</p>
          ) : null}
        </div>

        {error ? (
          <p className="authForm__error" role="alert">
            <Icon name="alert" size={16} />
            {error}
          </p>
        ) : null}

        <button className="btn btn--primary btn--block" type="submit" disabled={isLoading}>
          {isLoading ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>

      <p className="authPage__legal">
        Al crear tu cuenta aceptas los <Link to="/legal#terminos">términos</Link> y la <Link to="/legal">política de privacidad</Link>.
      </p>

      <p className="authPage__switch">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </AuthLayout>
  );
}
