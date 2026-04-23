import { ThemeToggle } from "@/components/ThemeToggle"

interface SessionHeaderProps {
  onOpenSidebar?: () => void
}

export function SessionHeader({ onOpenSidebar }: SessionHeaderProps) {
  return (
    <header className="sessionHeader">
      <div className="sessionHeader__actions">
        <ThemeToggle
          buttonClassName="theme-toggle-buttonReset"
          discClassName="sessionHeader__disc"
        />

        <button
          className="sessionHeader__menuButton"
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
        >
          <span aria-hidden="true">☰</span>
        </button>
      </div>
    </header>
  )
}
