import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import type { ChatConversation } from "@/services/chat/chatStorage"
import { Icon } from "@/components/ui/Icon"
import { ZenLogo } from "@/components/ui/ZenMark"
import { UserAvatar } from "@/components/ui/UserAvatar"
import { groupConversationsByDate } from "@/services/chat/conversationGroups"

interface SideNavProps {
  conversations: ChatConversation[]
  activeConversationId: string | null
  isOpen: boolean
  userLabel?: string | null
  userEmail?: string | null
  userAvatarUrl?: string | null
  canCreateConversation: boolean
  onClose: () => void
  onCreateConversation: () => void
  onSelectConversation: (conversationId: string) => void
  onDeleteConversation: (conversationId: string) => void
  onSignOut: () => void
}

export function SideNav({
  conversations,
  activeConversationId,
  isOpen,
  userLabel,
  userEmail,
  userAvatarUrl,
  canCreateConversation,
  onClose,
  onCreateConversation,
  onSelectConversation,
  onDeleteConversation,
  onSignOut,
}: SideNavProps) {
  const [query, setQuery] = useState("")

  const groups = useMemo(() => {
    const term = query.trim().toLowerCase()
    const visible = term
      ? conversations.filter((c) =>
          `${c.title} ${c.preview ?? ""} ${c.messages.map((m) => m.content).join(" ")}`.toLowerCase().includes(term),
        )
      : conversations
    return groupConversationsByDate(visible)
  }, [conversations, query])

  return (
    <>
      <div
        className={`sideNavBackdrop ${isOpen ? "sideNavBackdrop--visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sideNav ${isOpen ? "sideNav--open" : ""}`} aria-label="Menú">
        <div className="sideNav__header">
          <Link to="/chat" className="sideNav__brand" onClick={onClose}>
            <ZenLogo />
          </Link>
          <button className="iconBtn sideNav__close" type="button" onClick={onClose} aria-label="Cerrar menú">
            <Icon name="close" size={20} />
          </button>
        </div>

        <button
          className="sideNav__newChat"
          type="button"
          onClick={onCreateConversation}
          disabled={!canCreateConversation}
        >
          <Icon name="plus" size={16} />
          Nueva conversación
        </button>

        <label className="sideNav__search">
          <Icon name="search" size={16} />
          <span className="sr-only">Buscar conversaciones</span>
          <input
            type="search"
            placeholder="Buscar"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <section className="sideNav__conversations" aria-label="Conversaciones">
          {groups.length === 0 ? (
            <p className="sideNav__empty">
              {query ? "Ninguna conversación coincide con tu búsqueda." : "Tus conversaciones aparecerán aquí."}
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="sideNav__group">
                <p className="sideNav__groupLabel">{group.label}</p>
                <ul className="sideNav__list">
                  {group.items.map((conversation) => {
                    const isActive = conversation.id === activeConversationId
                    return (
                      <li
                        key={conversation.id}
                        className={`sideNav__item ${isActive ? "sideNav__item--active" : ""}`}
                      >
                        <button
                          className="sideNav__itemButton"
                          type="button"
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => onSelectConversation(conversation.id)}
                        >
                          {conversation.title}
                        </button>
                        <button
                          className="iconBtn sideNav__delete"
                          type="button"
                          onClick={() => onDeleteConversation(conversation.id)}
                          aria-label={`Borrar conversación: ${conversation.title}`}
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))
          )}
        </section>

        <div className="sideNav__footer">
          <Link to="/ajustes/perfil" className="sideNav__profile" onClick={onClose}>
            <UserAvatar name={userLabel} photoUrl={userAvatarUrl} size={32} />
            <span className="sideNav__profileCopy">
              <span className="sideNav__profileName">{userLabel ?? "Tu cuenta"}</span>
              {userEmail ? <span className="sideNav__profileEmail">{userEmail}</span> : null}
            </span>
          </Link>
          <Link to="/ajustes" className="iconBtn" aria-label="Configuración" onClick={onClose}>
            <Icon name="settings" />
          </Link>
          <button className="iconBtn" type="button" onClick={onSignOut} aria-label="Cerrar sesión">
            <Icon name="logout" />
          </button>
        </div>
      </aside>
    </>
  )
}
