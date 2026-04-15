import "../styles/navbar.css"
import disc from "../assets/disc.svg"

interface NavItem {
  label: string
  href: string
}

interface NavbarProps {
  brand?: string
  status?: "online" | "offline"
  links?: NavItem[]
  isAltTheme?: boolean
  onToggleTheme?: () => void
}

const defaultLinks: NavItem[] = [
  { label: "Chat", href: "#" },
  { label: "Conversaciones", href: "#" },
  { label: "Modelos", href: "#" },
  { label: "Ajustes", href: "#" }
]

export function Navbar({
  brand = "ZenAI",
  status = "online",
  links = defaultLinks,
  isAltTheme = false,
  onToggleTheme
}: NavbarProps) {
  return (
    <header className="navbar">
      <div className="navbar__container">

        <div className="navbar__brand">
          <span className="navbar__logo">{brand}</span>

          <div className="navbar__status">
            <span className="navbar__status-dot" />
            {status === "online" ? "Online" : "Offline"}
          </div>
        </div>

        <nav className="navbar__nav">
          {links.map((link) => (
            <a key={link.label} href={link.href} className="navbar__link">
              {link.label}
            </a>
          ))}
        </nav>

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
