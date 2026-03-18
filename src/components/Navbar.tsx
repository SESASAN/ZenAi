import "../styles/navbar.css"
import disc from "../assets/disc.svg"
import { useState } from "react"

interface NavItem {
  label: string
  href: string
}

interface NavbarProps {
  brand?: string
  status?: "online" | "offline"
  links?: NavItem[]
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
  links = defaultLinks
}: NavbarProps) {

  const [Mode, setMode] = useState(false)

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
          className={`navbar__disc ${Mode ? "navbar__disc--t" : ""}`}
          onClick={() => setMode(!Mode)}
          alt="Disc"
        />

      </div>
    </header>
  )
}