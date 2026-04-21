import disc from "@/assets/disc.svg"
import { useTheme } from "@/components/ThemeContext"

interface SessionHeaderProps {
  onOpenSidebar?: () => void
}

export function SessionHeader({ onOpenSidebar }: SessionHeaderProps) {
  const { isAltTheme, toggleTheme } = useTheme()

  return (
    <header className="sessionHeader">
      <div className="sessionHeader__actions">
        <img
          src={disc}
          className={`sessionHeader__disc ${isAltTheme ? "sessionHeader__disc--alt" : ""}`}
          onClick={toggleTheme}
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
