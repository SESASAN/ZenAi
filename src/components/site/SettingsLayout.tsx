import type { ReactNode } from "react"
import { Link, NavLink, useHref } from "react-router-dom"
import { Icon } from "@/components/ui/Icon"

const LINKS = [
  { to: "/ajustes", label: "Preferencias", end: true },
  { to: "/ajustes/perfil", label: "Perfil y cuenta", end: false },
  { to: "/historial", label: "Historial", end: false },
]

/** Settings, profile and history share this layout: side nav on desktop, tabs on phones. */
export function SettingsLayout({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  // Includes the router basename (/ZenAi/ in production) so the new tab opens the right page.
  const aboutHref = useHref("/acerca")

  return (
    <div className="settings">
      <nav className="settings__nav" aria-label="Cuenta">
        <Link to="/chat" className="settings__back">
          <Icon name="chevronLeft" size={18} />
          <span>Volver al chat</span>
        </Link>
        <div className="settings__tabs">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `settings__tab ${isActive ? "settings__tab--active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
          {/* Opens in a new tab so the chat stays where it was. */}
          <a href={aboutHref} target="_blank" rel="noopener noreferrer" className="settings__tab settings__tab--external">
            Acerca de ZenAI
            <Icon name="external" size={14} />
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>
        </div>
      </nav>

      <main className="settings__main">
        <div className="settings__content">
          <div className="settings__titleRow">
            <h1 className="settings__title">{title}</h1>
            {aside}
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}

export function SettingsRow({
  title,
  description,
  children,
  danger = false,
}: {
  title: string
  description?: ReactNode
  children?: ReactNode
  danger?: boolean
}) {
  return (
    <div className={`settingsRow ${danger ? "settingsRow--danger" : ""}`}>
      <div className="settingsRow__copy">
        <p className="settingsRow__title">{title}</p>
        {description ? <p className="settingsRow__desc">{description}</p> : null}
      </div>
      {children ? <div className="settingsRow__control">{children}</div> : null}
    </div>
  )
}
