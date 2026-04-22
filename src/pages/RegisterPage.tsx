import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/services/firebase/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

export function RegisterPage() {
  const baseUrl = import.meta.env.BASE_URL;
  const navigate = useNavigate();
  const { user, signIn, signInWithGithub, signUpWithEmail } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate("/chat", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await signUpWithEmail(email, password, fullName);
      navigate("/chat", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signIn();
      navigate("/chat", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGithub();
      navigate("/chat", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "GitHub sign-in failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-atmospheric">
        <div className="register-glow register-glow--top" />
        <div className="register-glow register-glow--bottom" />
        <div className="register-carbon" />
      </div>

      <div className="register-theme-toggle">
        <ThemeToggle />
      </div>

      <main className="register-container">
        <div className="register-editorial">
          <span className="register-eyebrow">Elevate Your Intelligence</span>
          <h1 className="register-headline">
            Enter the <br />
            <span className="register-gradient-text">ZenAI</span>
            <br />
            Sanctuary.
          </h1>
          <p className="register-copy">
            Experience a digital atmosphere designed for focus. Our AI doesn't just process—it exhales clarity into your complex workflows.
          </p>
        </div>

        <div className="register-card">
          <div className="register-card-header">
            <div className="register-card-icon">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <h2 className="register-card-title">Create Account</h2>
            <p className="register-card-subtitle">Begin your journey with ZenAI today.</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="register-field">
              <label className="register-label">Full Name</label>
              <input
                className="register-input"
                placeholder="John Doe"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="register-field">
              <label className="register-label">Email Address</label>
              <input
                className="register-input"
                placeholder="name@sanctuary.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="register-password-row">
              <div className="register-field">
                <label className="register-label">Password</label>
                <input
                  className="register-input"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>
              <div className="register-field">
                <label className="register-label">Confirm</label>
                <input
                  className="register-input"
                  placeholder="••••••••"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && <p className="register-error" role="alert">{error}</p>}

            <button
              className="register-submit"
              type="submit"
              disabled={isLoading}
            >
              Create Account
            </button>
          </form>

          <div className="register-divider">
            <div className="register-divider-line" />
            <span className="register-divider-text">Or continue with</span>
            <div className="register-divider-line" />
          </div>

          <div className="register-social">
            <button
              className="register-social-btn"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <img alt="Google" className="register-social-icon" src={`${baseUrl}google-icon-logo-svgrepo-com.svg`} />
              <span>Google</span>
            </button>
            <button
              className="register-social-btn"
              onClick={handleGithubSignIn}
              disabled={isLoading}
            >
              <img alt="GitHub" className="register-social-icon" src={`${baseUrl}github-white.svg`} />
              <span>GitHub</span>
            </button>
          </div>

          <p className="register-footer">
            Already have an account?{" "}
            <Link className="register-footer-link" to="/login">Sign In</Link>
          </p>
        </div>
      </main>

      <div className="register-accent">
        <div className="register-accent-line" />
        <div className="register-accent-dot" />
        <div className="register-accent-line" />
      </div>
    </div>
  );
}
