export function AppLoadingScreen() {
  // NOTE: we intentionally reuse the login atmospheric classes for now.
  // Phase 1 goal is to move responsibilities out of App.tsx without changing visuals.
  return (
    <div className="login-page">
      <div className="login-atmospheric">
        <div className="login-glow login-glow--top" />
        <div className="login-glow login-glow--bottom" />
        <div className="login-bg-glow" />
      </div>
      <div className="login-branding">
        <h1 className="login-title">ZenAI</h1>
      </div>
    </div>
  )
}

