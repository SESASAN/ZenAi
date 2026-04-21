import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/services/firebase/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

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

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signInWithEmail(email, password);
      navigate("/chat", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";
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
    <div className="login-page">
      <div className="login-atmospheric">
        <div className="login-glow login-glow--top" />
        <div className="login-glow login-glow--bottom" />
        <div className="login-bg-glow" />
      </div>

      <div className="login-theme-toggle">
        <ThemeToggle />
      </div>

      <main className="login-container">
        <div className="login-branding">
          <h1 className="login-title">ZenAI</h1>
          <p className="login-tagline">Enter the Digital Sanctuary</p>
        </div>

        <div className="login-card">
          <header className="login-card-header">
            <h2 className="login-card-title">Welcome Back</h2>
            <p className="login-card-subtitle">
              Please enter your details to continue
            </p>
          </header>

          <form className="login-form" onSubmit={handleEmailAuth}>
            <div className="login-field">
              <label className="login-label">Email Address</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon material-symbols-outlined">alternate_email</span>
                <input
                  className="login-input"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <div className="login-field-header">
                <label className="login-label">Password</label>
                <a className="login-forgot" href="#">
                  Forgot?
                </a>
              </div>
              <div className="login-input-wrapper">
                <span className="login-input-icon material-symbols-outlined">lock</span>
                <input
                  className="login-input"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && <p className="login-error" role="alert">{error}</p>}

            <button
              className="login-submit"
              type="submit"
              disabled={isLoading}
            >
              <div className="login-submit-bg" />
              <span className="login-submit-text">
                {isLoading ? "Please wait..." : "Sign In"}
              </span>
            </button>
          </form>

          <div className="login-divider">
            <div className="login-divider-line" />
            <span className="login-divider-text">Or continue with</span>
            <div className="login-divider-line" />
          </div>

          <div className="login-social">
            <button
              className="login-social-btn"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <img
                alt="Google"
                className="login-social-icon"
                src="/google-icon-logo-svgrepo-com.svg"
              />
              <span>Google</span>
            </button>
            <button
              className="login-social-btn"
              onClick={handleGithubSignIn}
              disabled={isLoading}
            >
              <img
                alt="GitHub"
                className="login-social-icon"
                src="/github-white.svg"
              />
              <span>GitHub</span>
            </button>
          </div>

          <p className="login-footer">
            Don't have an account?{" "}
            <a className="login-footer-link" href="/register">
              Create access
            </a>
          </p>
        </div>

        <footer className="login-compliance">
          <div className="login-compliance-item">
            <span className="login-compliance-icon material-symbols-outlined">verified_user</span>
            <span>End-to-End Encrypted</span>
          </div>
          <div className="login-compliance-item">
            <span className="login-compliance-icon material-symbols-outlined">shield</span>
            <span>ISO 27001 Certified</span>
          </div>
        </footer>
      </main>

      <div className="login-bottom-bar" />
    </div>
  );
}