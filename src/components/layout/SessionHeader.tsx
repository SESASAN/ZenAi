import disc from "@/assets/disc.svg"

interface SessionHeaderProps {
  isAltTheme: boolean
  onOpenSidebar?: () => void
  onToggleTheme: () => void
}

export function SessionHeader({
  isAltTheme,
  onOpenSidebar,
  onToggleTheme
}: SessionHeaderProps) {
  return (
    <header className="sessionHeader">
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
