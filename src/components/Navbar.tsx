import "../styles/navbar.css"
import disc from "../assets/disc.svg"

interface NavItem {
  label: string
  href: string
}

interface NavbarProps {
  brand?: string
  links?: NavItem[]
  isAltTheme?: boolean
  onToggleTheme?: () => void
  userLabel?: string | null
  onSignIn?: () => void
  onSignOut?: () => void
}

const defaultLinks: NavItem[] = [
  { label: "Chat", href: "#" },
  { label: "Conversaciones", href: "#" },
  { label: "Modelos", href: "#" },
  { label: "Ajustes", href: "#" }
]

export function Navbar({
  brand = "ZenAI",
  links = defaultLinks,
  isAltTheme = false,
  onToggleTheme,
  userLabel = null,
  onSignIn,
  onSignOut
}: NavbarProps) {
  return (
    <header className="navbar">
      <div className="navbar__container">

        <div className="navbar__brand">
          <span className="navbar__logo">{brand}</span>
        </div>

        <nav className="navbar__nav">
          {links.map((link) => (
            <a key={link.label} href={link.href} className="navbar__link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="navbar__auth">
          {userLabel ? (
            <>
              <span className="navbar__user" title={userLabel}>
                {userLabel}
              </span>
              <button
                className="navbar__authButton"
                type="button"
                onClick={onSignOut}
              >
                Salir
              </button>
            </>
          ) : (
            <button
              className="navbar__authButton"
              type="button"
              onClick={onSignIn}
            >
              Ingresar
            </button>
          )}
        </div>

        <img
          src={disc}
          className={`navbar__disc ${isAltTheme ? "navbar__disc--t" : ""}`}
          onClick={onToggleTheme}
          alt="Disc"
          role="button"
          aria-label="Cambiar tema de la aplicación"
        />

      </div>
    </header>
  )
}
