import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { User } from "firebase/auth"
import { SettingsLayout } from "@/components/site/SettingsLayout"
import { Icon } from "@/components/ui/Icon"
import { useChat } from "@/hooks/useChat"
import { formatConversationTime, groupConversationsByDate } from "@/services/chat/conversationGroups"

export function HistoryPage({ user }: { user: User }) {
  const navigate = useNavigate()
  const chat = useChat(user)
  const [query, setQuery] = useState("")
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const saved = useMemo(
    () => chat.conversations.filter((c) => c.messages.length > 0 || c.isLoaded === false),
    [chat.conversations],
  )

  const groups = useMemo(() => {
    const term = query.trim().toLowerCase()
    const visible = term
      ? saved.filter((c) =>
          `${c.title} ${c.preview ?? ""} ${c.messages.map((m) => m.content).join(" ")}`.toLowerCase().includes(term),
        )
      : saved
    return groupConversationsByDate(visible)
  }, [saved, query])

  const count = saved.length

  return (
    <SettingsLayout
      title="Historial"
      aside={<span className="settings__count">{count === 1 ? "1 conversación" : `${count} conversaciones`}</span>}
    >
      <label className="historySearch">
        <Icon name="search" size={18} />
        <span className="sr-only">Buscar conversaciones</span>
        <input
          type="search"
          placeholder="Buscar por título o contenido"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {chat.syncError ? (
        <p className="chatSyncNote" role="status">
          <Icon name="alert" size={16} />
          {chat.syncError}
        </p>
      ) : null}
      {chat.error ? (
        <p className="field__error" role="alert">
          <Icon name="alert" size={14} />
          {chat.error.message}
        </p>
      ) : null}

      {groups.length === 0 ? (
        <div className="historyEmpty">
          <Icon name="chat" size={24} />
          <p className="historyEmpty__title">{query ? "Sin resultados" : "Aún no hay conversaciones"}</p>
          <p className="historyEmpty__desc">
            {query ? "Prueba con otras palabras." : "Cuando hables con ZenAI, tus conversaciones aparecerán aquí."}
          </p>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.label} className="historyGroup" aria-label={group.label}>
            <h2 className="settings__section">{group.label}</h2>
            <ul className="historyList">
              {group.items.map((conversation) => {
                const preview =
                  conversation.messages.at(-1)?.content || conversation.preview || "Sin mensajes cargados todavía"
                if (pendingDelete === conversation.id) {
                  return (
                    <li key={conversation.id} className="confirmBox" role="alertdialog" aria-label="Confirmar borrado">
                      <div className="confirmBox__copy">
                        <p className="confirmBox__title">¿Borrar “{conversation.title}”?</p>
                        <p className="confirmBox__desc">Se elimina de todos tus dispositivos y no se puede deshacer.</p>
                      </div>
                      <div className="confirmBox__actions">
                        <button className="btn btn--sm btn--secondary" type="button" onClick={() => setPendingDelete(null)}>
                          Cancelar
                        </button>
                        <button
                          className="btn btn--sm btn--danger-solid"
                          type="button"
                          onClick={() => {
                            void chat.deleteConversation(conversation.id)
                            setPendingDelete(null)
                          }}
                        >
                          Borrar
                        </button>
                      </div>
                    </li>
                  )
                }
                return (
                  <li key={conversation.id} className="historyItem">
                    <button
                      type="button"
                      className="historyItem__open"
                      onClick={() => navigate("/chat", { state: { conversationId: conversation.id } })}
                    >
                      <span className="historyItem__title">{conversation.title}</span>
                      <span className="historyItem__preview">{preview}</span>
                    </button>
                    <span className="historyItem__time">{formatConversationTime(conversation.updatedAt)}</span>
                    <button
                      type="button"
                      className="iconBtn"
                      aria-label={`Borrar conversación: ${conversation.title}`}
                      onClick={() => setPendingDelete(conversation.id)}
                    >
                      <Icon name="trash" size={17} />
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))
      )}
    </SettingsLayout>
  )
}
