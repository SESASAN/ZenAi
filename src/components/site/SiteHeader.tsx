import { Link } from "react-router-dom"
import { ZenLogo } from "@/components/ui/ZenMark"
import { useAuth } from "@/services/firebase/useAuth"

/** Header for public pages (landing, about, legal). */
export function SiteHeader({ showNav = true }: { showNav?: boolean }) {
  const { user } = useAuth()

  return (
    <header className="siteHeader">
      <div className="siteHeader__inner">
        <Link to="/" className="siteHeader__brand" aria-label="ZenAI, inicio">
          <ZenLogo size={24} />
        </Link>

        {showNav ? (
          <nav className="siteHeader__nav" aria-label="Principal">
            <a href="#funciones" className="siteHeader__link">Funciones</a>
            <a href="#como" className="siteHeader__link">Cómo funciona</a>
            <a href="#modelos" className="siteHeader__link">Modelos</a>
            <Link to="/acerca" className="siteHeader__link">Acerca de</Link>
            <a href="https://github.com/SESASAN/ZenAi" className="siteHeader__link" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </nav>
        ) : null}

        <div className="siteHeader__actions">
          {user ? (
            <Link to="/chat" className="btn btn--sm btn--primary">Ir al chat</Link>
          ) : (
            <>
              <Link to="/login" className="siteHeader__link siteHeader__login">Iniciar sesión</Link>
              <Link to="/register" className="btn btn--sm btn--primary">Crear cuenta</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
