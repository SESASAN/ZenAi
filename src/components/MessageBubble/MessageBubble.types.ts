export type MessageRole = "user" | "assistant"

export interface Message {
    id: string
    content: string
    role: MessageRole
}

export interface MessageBubbleProps {
    message: Message
}
