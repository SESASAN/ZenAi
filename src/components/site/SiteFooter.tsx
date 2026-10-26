import { Link } from "react-router-dom"
import { ZenMark } from "@/components/ui/ZenMark"

export function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div className="siteFooter__inner">
        <span className="siteFooter__brand">
          <ZenMark size={18} strokeWidth={2.6} />
          ZenAI
        </span>
        <span className="siteFooter__credit">
          © {new Date().getFullYear()} · Creado por{" "}
          <a href="https://sesasan.is-a.dev" target="_blank" rel="noopener noreferrer">SESASAN</a>
        </span>
        <nav className="siteFooter__nav" aria-label="Pie de página">
          <Link to="/acerca">Acerca de</Link>
          <Link to="/legal">Privacidad</Link>
          <Link to="/legal#terminos">Términos</Link>
          <a href="https://github.com/SESASAN/ZenAi" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </div>
    </footer>
  )
}
