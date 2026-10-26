import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ZenLogo } from "@/components/ui/ZenMark"

/** Centered single-column layout for sign in, sign up and password recovery. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="authPage">
      <header className="authPage__header">
        <Link to="/" className="authPage__brand" aria-label="ZenAI, inicio">
          <ZenLogo size={24} />
        </Link>
      </header>
      <main className="authPage__main">
        <div className="authPage__content">{children}</div>
      </main>
      <footer className="authPage__footer">
        <Link to="/legal">Privacidad</Link>
        <Link to="/legal#terminos">Términos</Link>
      </footer>
    </div>
  )
}

export function SocialButtons({
  onGoogle,
  onGithub,
  disabled,
  compact = false,
}: {
  onGoogle: () => void
  onGithub: () => void
  disabled?: boolean
  compact?: boolean
}) {
  const baseUrl = import.meta.env.BASE_URL
  return (
    <div className={`authSocial ${compact ? "authSocial--compact" : ""}`}>
      <button className="btn btn--soft btn--block authSocial__btn" type="button" onClick={onGoogle} disabled={disabled}>
        <img alt="" src={`${baseUrl}google-icon-logo-svgrepo-com.svg`} width={18} height={18} />
        {compact ? "Google" : "Continuar con Google"}
      </button>
      <button className="btn btn--soft btn--block authSocial__btn" type="button" onClick={onGithub} disabled={disabled}>
        <img alt="" src={`${baseUrl}github-white.svg`} width={18} height={18} />
        {compact ? "GitHub" : "Continuar con GitHub"}
      </button>
    </div>
  )
}
