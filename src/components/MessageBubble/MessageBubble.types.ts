export type MessageRole = "user" | "assistant"

export interface Message {
    id: number
    content: string
    role: MessageRole
}

export interface MessageBubbleProps {
    message: Message
}