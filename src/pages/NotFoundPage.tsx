import { Link } from "react-router-dom"
import { ZenLogo, ZenMark } from "@/components/ui/ZenMark"
import { useAuth } from "@/services/firebase/useAuth"

export function NotFoundPage() {
  const { user } = useAuth()
  return (
    <div className="statusPage">
      <header className="statusPage__header">
        <Link to="/" className="authPage__brand" aria-label="ZenAI, inicio">
          <ZenLogo size={24} />
        </Link>
      </header>
      <main className="statusPage__main statusPage__main--center">
        <ZenMark size={112} strokeWidth={1} color="var(--line-strong)" />
        <p className="statusPage__code">Error 404</p>
        <h1 className="statusPage__title">Esta página no existe</h1>
        <p className="statusPage__desc">Puede que el enlace esté mal escrito o que la conversación se haya borrado.</p>
        <div className="statusPage__actions">
          {user ? <Link to="/chat" className="btn btn--primary">Ir al chat</Link> : <Link to="/login" className="btn btn--primary">Iniciar sesión</Link>}
          <Link to="/" className="btn btn--secondary">Página de inicio</Link>
        </div>
      </main>
    </div>
  )
}
