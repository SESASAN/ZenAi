import { forwardRef } from "react"
import type { Message } from "@/components/MessageBubble"
import { ChatMessage } from "@/components/chat/messages"
import { ZenMark } from "@/components/ui/ZenMark"

export interface ChatTimelineProps {
  messages: Message[]
  /** Accessible status (e.g. "ZenAI está pensando…"); shows the typing indicator. */
  statusText?: string | null
  /** True while the first token of the answer has not arrived. */
  isThinking?: boolean
  streamingMessageId?: string | null
  userInitial?: string
  userAvatarUrl?: string | null
  /** Fills the composer with a suggested prompt (empty state). */
  onSuggestion?: (prompt: string) => void
}

const SUGGESTIONS: Array<{ title: string; prompt: string }> = [
  { title: "Explícame un concepto", prompt: "Explícame qué es una API REST en palabras simples." },
  { title: "Revisa mi código", prompt: "¿Por qué este fetch me devuelve undefined?\n\n" },
  { title: "Resume un texto", prompt: "Resume este texto en tres ideas clave:\n\n" },
  { title: "Prepárame para un examen", prompt: "Hazme 5 preguntas de práctica sobre " },
]

export const ChatTimeline = forwardRef<HTMLElement, ChatTimelineProps>(function ChatTimeline(
  { messages, statusText = null, isThinking = false, streamingMessageId = null, userInitial, userAvatarUrl, onSuggestion },
  ref,
) {
  const isEmpty = messages.length === 0 && !statusText

  return (
    <section
      ref={ref}
      className={`messageList ${isEmpty ? "messageList--empty" : ""}`}
      aria-label="Mensajes"
      aria-live="polite"
      aria-busy={Boolean(statusText)}
    >
      <div className="messageList__inner">
        {isEmpty ? (
          <div className="chatWelcome">
            <ZenMark size={40} strokeWidth={2} className="chatWelcome__mark" />
            <h1 className="chatWelcome__title">¿En qué te ayudo hoy?</h1>
            <p className="chatWelcome__subtitle">Pregunta, estudia o programa. Escribe abajo o elige una idea.</p>
            {onSuggestion ? (
              <div className="chatWelcome__suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s.title} type="button" className="chatWelcome__suggestion" onClick={() => onSuggestion(s.prompt)}>
                    {s.title}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isStreaming={message.id === streamingMessageId}
            userInitial={userInitial}
            userAvatarUrl={userAvatarUrl}
          />
        ))}

        {statusText ? (
          <div className="chatStatus" role="status">
            {isThinking ? (
              <>
                <span className="chatStatus__mark" aria-hidden="true">
                  <ZenMark size={15} strokeWidth={2.6} />
                </span>
                <span className="typingDots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </>
            ) : null}
            <span className={isThinking ? "sr-only" : "chatStatus__text"}>{statusText}</span>
          </div>
        ) : null}

        <div data-chat-end="" aria-hidden="true" />
      </div>
    </section>
  )
})
