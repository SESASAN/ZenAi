import { forwardRef } from "react"
import type { Message } from "@/components/MessageBubble"
import { ChatMessage } from "@/components/chat/messages"

interface EmptyStateCopy {
  title: string
  description: string
}

export interface ChatTimelineProps {
  messages: Message[]
  isSending: boolean
  emptyStateCopy?: EmptyStateCopy
  userInitial?: string
}

const DEFAULT_EMPTY_STATE: EmptyStateCopy = {
  title: "Este chat está vacío",
  description: "Empezá la conversación con una idea, una pregunta o una tarea para ZenAI."
}

export const ChatTimeline = forwardRef<HTMLElement, ChatTimelineProps>(function ChatTimeline(
  {
    messages,
    isSending,
    emptyStateCopy = DEFAULT_EMPTY_STATE,
    userInitial
  },
  ref
) {
  return (
    <section
      ref={ref}
      className="messageList"
      aria-label="Lista de mensajes"
    >
      <div className="messageList__inner">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} userInitial={userInitial} />
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
      </div>
    </section>
  )
})
