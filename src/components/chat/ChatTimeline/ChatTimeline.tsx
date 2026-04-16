import { forwardRef } from "react"
import { MessageBubble, type Message } from "@/components/MessageBubble"

interface EmptyStateCopy {
  title: string
  description: string
}

export interface ChatTimelineProps {
  messages: Message[]
  isSending: boolean
  emptyStateCopy?: EmptyStateCopy
}

const DEFAULT_EMPTY_STATE: EmptyStateCopy = {
  title: "Este chat está vacío",
  description: "Empezá la conversación con una idea, una pregunta o una tarea para ZenAI."
}

export const ChatTimeline = forwardRef<HTMLElement, ChatTimelineProps>(function ChatTimeline(
  {
    messages,
    isSending,
    emptyStateCopy = DEFAULT_EMPTY_STATE
  },
  ref
) {
  return (
    <section
      ref={ref}
      className="messageList"
      aria-label="Lista de mensajes"
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {messages.length === 0 && !isSending && (
        <div className="chatEmptyState">
          <p className="chatEmptyTitle">{emptyStateCopy.title}</p>
          <p className="chatEmptyDescription">
            {emptyStateCopy.description}
          </p>
        </div>
      )}

      {isSending && (
        <p className="chatStatus" role="status">
          ZenAI está pensando...
        </p>
      )}

      <div data-chat-end="" aria-hidden="true" />
    </section>
  )
})
