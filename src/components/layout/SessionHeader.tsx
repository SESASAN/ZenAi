import { ThemeToggle } from "@/components/ThemeToggle"
import { Icon } from "@/components/ui/Icon"
import { ModelSelector } from "@/components/chat/ModelSelector"
import type { ModelOption } from "@/services/chat/models"

export type ConnectionStatus = "online" | "paused" | "offline"

const STATUS_COPY: Record<ConnectionStatus, string> = {
  online: "En línea",
  paused: "En pausa",
  offline: "Sin conexión",
}

interface SessionHeaderProps {
  onOpenSidebar?: () => void
  onNewConversation?: () => void
  canCreateConversation?: boolean
  model: ModelOption
  onModelChange: (option: ModelOption) => void
  isModelLocked?: boolean
  status?: ConnectionStatus
}

export function SessionHeader({
  onOpenSidebar,
  onNewConversation,
  canCreateConversation = true,
  model,
  onModelChange,
  isModelLocked = false,
  status = "online",
}: SessionHeaderProps) {
  return (
    <header className="sessionHeader">
      <button
        className="iconBtn iconBtn--lg sessionHeader__menu"
        type="button"
        onClick={onOpenSidebar}
        aria-label="Abrir menú"
      >
        <Icon name="menu" size={22} />
      </button>

      <div className="sessionHeader__center">
        <ModelSelector value={model} onChange={onModelChange} disabled={isModelLocked} />
        <span className={`sessionHeader__status sessionHeader__status--${status}`}>
          <span className="sessionHeader__statusDot" aria-hidden="true" />
          {STATUS_COPY[status]}
        </span>
      </div>

      <div className="sessionHeader__actions">
        <ThemeToggle />
        <button
          className="iconBtn iconBtn--lg sessionHeader__new"
          type="button"
          onClick={onNewConversation}
          disabled={!canCreateConversation}
          aria-label="Nueva conversación"
        >
          <Icon name="edit" size={20} />
        </button>
      </div>
    </header>
  )
}
