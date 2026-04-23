import type { Message } from "@/components/MessageBubble"

export type ChatConversation = {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

const CHAT_STORAGE_KEY_BASE = "zenai-chat-conversations"

function getChatStorageKey(uid: string) {
  return `${CHAT_STORAGE_KEY_BASE}:${uid}`
}

function createConversationTitleFallback() {
  return "New chat"
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

export function loadConversations(uid: string): ChatConversation[] {
  const raw = window.localStorage.getItem(getChatStorageKey(uid))

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

export function saveConversations(uid: string, conversations: ChatConversation[]) {
  window.localStorage.setItem(getChatStorageKey(uid), JSON.stringify(conversations))
}

export function clearConversations(uid: string) {
  window.localStorage.removeItem(getChatStorageKey(uid))
}
