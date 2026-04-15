import type { Message } from "@/components/MessageBubble"

export type ChatConversation = {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

const CHAT_STORAGE_KEY = "zenai-chat-conversations"

function createConversationTitleFallback() {
  return "Nuevo chat"
}

export function createConversation(): ChatConversation {
  const now = Date.now()

  return {
    id: crypto.randomUUID(),
    title: createConversationTitleFallback(),
    messages: [],
    createdAt: now,
    updatedAt: now
  }
}

export function buildConversationTitle(message: string) {
  const normalized = message.trim().replace(/\s+/g, " ")

  if (!normalized) {
    return createConversationTitleFallback()
  }

  return normalized.length > 32
    ? `${normalized.slice(0, 32).trimEnd()}...`
    : normalized
}

export function loadConversations(): ChatConversation[] {
  const raw = window.localStorage.getItem(CHAT_STORAGE_KEY)

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as ChatConversation[]

    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveConversations(conversations: ChatConversation[]) {
  window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations))
}
