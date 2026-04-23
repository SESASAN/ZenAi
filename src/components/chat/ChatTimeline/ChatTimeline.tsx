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
  userAvatarUrl?: string | null
}

const DEFAULT_EMPTY_STATE: EmptyStateCopy = {
  title: "This chat is empty",
  description: "Start the conversation with an idea, a question, or a task for ZenAI."
}

export const ChatTimeline = forwardRef<HTMLElement, ChatTimelineProps>(function ChatTimeline(
  {
    messages,
    isSending,
    emptyStateCopy = DEFAULT_EMPTY_STATE,
    userInitial,
    userAvatarUrl
  },
  ref
) {
  return (
    <section
      ref={ref}
      className="messageList"
      aria-label="Message list"
    >
      <div className="messageList__inner">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            userInitial={userInitial}
            userAvatarUrl={userAvatarUrl}
          />
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
          <div className="chatStatusPill" role="status">
            ZenAI is thinking...
          </div>
        )}

        <div data-chat-end="" aria-hidden="true" />
      </div>
    </section>
  )
})
