import type { ChatConversation } from "@/services/chat/chatStorage"

interface SideNavProps {
  conversations: ChatConversation[]
  activeConversationId: string | null
  isOpen: boolean
  userLabel?: string | null
  userAvatarUrl?: string | null
  canCreateConversation: boolean
  onClose: () => void
  onCreateConversation: () => void
  onSelectConversation: (conversationId: string) => void
  onSignIn: () => void
  onSignOut: () => void
}

const NAV_ITEMS = [
  { label: "Models", disabled: false },
  { label: "History", disabled: true },
  { label: "Library", disabled: true }
] as const

export function SideNav({
  conversations,
  activeConversationId,
  isOpen,
  userLabel,
  userAvatarUrl,
  canCreateConversation,
  onClose,
  onCreateConversation,
  onSelectConversation,
  onSignIn,
  onSignOut
}: SideNavProps) {
  const initial = (userLabel ?? "Z").slice(0, 1).toUpperCase()
  const showAvatar = Boolean(userAvatarUrl)

  return (
    <>
      <div
        className={`sideNavBackdrop ${isOpen ? "sideNavBackdrop--visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sideNav ${isOpen ? "sideNav--open" : ""}`}>
        <div className="sideNav__header">
          <div>
            <p className="sideNav__brand">ZenAI</p>
            <p className="sideNav__tagline">Atmospheric Intelligence</p>
          </div>

          <button
            className="sideNav__close"
            type="button"
            onClick={onClose}
            aria-label="Cerrar navegación"
          >
            ×
          </button>
        </div>

        <button
          className="sideNav__newChat"
          type="button"
          onClick={onCreateConversation}
          disabled={!canCreateConversation}
        >
          <span aria-hidden="true">＋</span>
          New Chat
        </button>

        <nav className="sideNav__nav" aria-label="Secciones principales">
          {NAV_ITEMS.map((item, index) => (
            <button
              key={item.label}
              className={`sideNav__navItem ${index === 0 ? "sideNav__navItem--active" : ""}`}
              type="button"
              disabled={item.disabled}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <section className="sideNav__conversations" aria-label="Lista de conversaciones">
          <div className="sideNav__conversationsHeader">
            <p className="sideNav__sectionLabel">Chats</p>
          </div>

          <div className="sideNav__conversationList">
            {conversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId
              const preview = conversation.messages.at(-1)?.content ?? "Sin mensajes todavía"

              return (
                <button
                  key={conversation.id}
                  className={`sideNav__conversationItem ${isActive ? "sideNav__conversationItem--active" : ""}`}
                  type="button"
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <span className="sideNav__conversationTitle">{conversation.title}</span>
                  <span className="sideNav__conversationPreview">{preview}</span>
                </button>
              )
            })}
          </div>
        </section>

        <div className="sideNav__footer">
          <div className="sideNav__profile">
            <div className="sideNav__avatar" aria-hidden="true">
              {showAvatar ? (
                <img
                  className="sideNav__avatarImage"
                  src={userAvatarUrl ?? ""}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                initial
              )}
            </div>

            <div className="sideNav__profileCopy">
              <span className="sideNav__profileName">{userLabel ?? "Invitado"}</span>
              <span className="sideNav__profileMeta">
                {userLabel ? "Sesión iniciada" : "Necesitás ingresar"}
              </span>
            </div>
          </div>

          {userLabel ? (
            <button className="sideNav__authButton" type="button" onClick={onSignOut}>
              Salir
            </button>
          ) : (
            <button className="sideNav__authButton" type="button" onClick={onSignIn}>
              Ingresar
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
