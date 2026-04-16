import disc from "@/assets/disc.svg"

interface SessionHeaderProps {
  title: string
  eyebrow?: string
  isAltTheme: boolean
  onOpenSidebar?: () => void
  onToggleTheme: () => void
}

export function SessionHeader({
  title,
  eyebrow = "Current Session",
  isAltTheme,
  onOpenSidebar,
  onToggleTheme
}: SessionHeaderProps) {
  return (
    <header className="sessionHeader">
      <div>
        <p className="sessionHeader__eyebrow">{eyebrow}</p>
        <h1 className="sessionHeader__title">{title}</h1>
      </div>

      <div className="sessionHeader__actions">
        <img
          src={disc}
          className={`sessionHeader__disc ${isAltTheme ? "sessionHeader__disc--alt" : ""}`}
          onClick={onToggleTheme}
          alt="Cambiar paleta visual"
          role="button"
          aria-label="Cambiar color de la interfaz"
        />

        <button
          className="sessionHeader__menuButton"
          type="button"
          onClick={onOpenSidebar}
          aria-label="Abrir navegación"
        >
          <span aria-hidden="true">☰</span>
        </button>
      </div>
    </header>
  )
}
