import type { Message } from "@/components/MessageBubble"
import { AssistantMessage } from "@/components/chat/messages/AssistantMessage"
import { UserMessage } from "@/components/chat/messages/UserMessage"

type AssistantMessageModel = Message & { role: "assistant" }
type UserMessageModel = Message & { role: "user" }

function isAssistantMessage(message: Message): message is AssistantMessageModel {
  return message.role === "assistant"
}

function isUserMessage(message: Message): message is UserMessageModel {
  return message.role === "user"
}

interface ChatMessageProps {
  message: Message
  userInitial?: string
  userAvatarUrl?: string | null
}

export function ChatMessage({ message, userInitial, userAvatarUrl }: ChatMessageProps) {
  if (isAssistantMessage(message)) {
    return <AssistantMessage message={message} />
  }

  if (isUserMessage(message)) {
    return <UserMessage message={message} userInitial={userInitial} userAvatarUrl={userAvatarUrl} />
  }

  return null
}
