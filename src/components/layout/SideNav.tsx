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
  onDeleteConversation: (conversationId: string) => void
  onSignIn: () => void
  onSignOut: () => void
}

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
  onDeleteConversation,
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
            aria-label="Close navigation"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        <button
          className="sideNav__newChat"
          type="button"
          onClick={onCreateConversation}
          disabled={!canCreateConversation}
        >
          <span aria-hidden="true">+</span>
          New Chat
        </button>

        <section className="sideNav__conversations" aria-label="Conversation list">
          <div className="sideNav__conversationsHeader">
            <p className="sideNav__sectionLabel">Conversations</p>
          </div>

          <div className="sideNav__conversationList">
            {conversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId
              const preview = conversation.messages.at(-1)?.content ?? "No messages yet"

              return (
                <div
                  key={conversation.id}
                  className={`sideNav__conversationItem ${isActive ? "sideNav__conversationItem--active" : ""}`}
                >
                  <button
                    className="sideNav__conversationContent"
                    type="button"
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    <span className="sideNav__conversationTitle">{conversation.title}</span>
                    <span className="sideNav__conversationPreview">{preview}</span>
                  </button>

                  <button
                    className="sideNav__deleteButton"
                    type="button"
                    onClick={() => onDeleteConversation(conversation.id)}
                    aria-label="Delete chat"
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">
                      delete
                    </span>
                  </button>
                </div>
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
              <span className="sideNav__profileName">{userLabel ?? "Guest"}</span>
            </div>
          </div>

          {userLabel ? (
            <button className="sideNav__authButton" type="button" onClick={onSignOut}>
              Sign out
            </button>
          ) : (
            <button className="sideNav__authButton" type="button" onClick={onSignIn}>
              Sign in
            </button>
          )}
        </div>
      </aside>
    </>
  )
}

