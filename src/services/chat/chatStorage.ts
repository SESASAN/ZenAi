import type { Message } from "@/components/MessageBubble"
import type { RemoteConversationSummary } from "./conversationsApi"

export type ChatConversation = {
  id: string
  title: string
  preview?: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  /** false when only the summary is known and messages must be fetched from the server. */
  isLoaded?: boolean
}

const CHAT_STORAGE_KEY_BASE = "zenai-chat-conversations"
export const DEFAULT_CONVERSATION_TITLE = "Nueva conversación"

function getChatStorageKey(uid: string) {
  return `${CHAT_STORAGE_KEY_BASE}:${uid}`
}

export function createId() {
  return crypto.randomUUID()
}

export function createConversation(): ChatConversation {
  const now = Date.now()

  return {
    id: createId(),
    title: DEFAULT_CONVERSATION_TITLE,
    messages: [],
    createdAt: now,
    updatedAt: now,
    isLoaded: true,
  }
}

export function buildConversationTitle(message: string) {
  const normalized = message.trim().replace(/\s+/g, " ")

  if (!normalized) {
    return DEFAULT_CONVERSATION_TITLE
  }

  return normalized.length > 32
    ? `${normalized.slice(0, 32).trimEnd()}...`
    : normalized
}

/** A conversation exists on the server once it has at least one assistant reply. */
export function isPersistedRemotely(conversation: ChatConversation) {
  return conversation.isLoaded === false || conversation.messages.some((m) => m.role === "assistant")
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function normalizeMessage(raw: unknown): Message | null {
  if (!isRecord(raw)) return null
  if ((raw.role !== "user" && raw.role !== "assistant") || typeof raw.content !== "string") return null
  // Older versions used numeric ids (Date.now()).
  const id = typeof raw.id === "string" || typeof raw.id === "number" ? String(raw.id) : createId()
  return { id, role: raw.role, content: raw.content }
}

function normalizeConversation(raw: unknown): ChatConversation | null {
  if (!isRecord(raw) || typeof raw.id !== "string") return null
  const messages = Array.isArray(raw.messages)
    ? raw.messages.map(normalizeMessage).filter((m): m is Message => m !== null && m.content.length > 0)
    : []
  return {
    id: raw.id,
    title: typeof raw.title === "string" && raw.title ? raw.title : DEFAULT_CONVERSATION_TITLE,
    preview: typeof raw.preview === "string" ? raw.preview : undefined,
    messages,
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : Date.now(),
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : Date.now(),
    isLoaded: raw.isLoaded === false ? false : true,
  }
}

/** Local cache: makes the UI instant and works offline. The server is the source of truth. */
export function loadConversations(uid: string): ChatConversation[] {
  try {
    const raw = window.localStorage.getItem(getChatStorageKey(uid))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.map(normalizeConversation).filter((c): c is ChatConversation => c !== null)
      : []
  } catch {
    return []
  }
}

export function saveConversations(uid: string, conversations: ChatConversation[]) {
  try {
    window.localStorage.setItem(getChatStorageKey(uid), JSON.stringify(conversations))
  } catch {
    // Storage full or unavailable: the server still has the data.
  }
}

export function clearConversations(uid: string) {
  try {
    window.localStorage.removeItem(getChatStorageKey(uid))
  } catch {
    // ignore
  }
}

/**
 * Merges the local cache with the server list:
 * - server conversations win; cached messages are reused only if the cache is up to date,
 * - local-only conversations are kept only if they were never persisted (drafts / failed first message),
 *   so chats deleted on another device disappear here too.
 */
export function mergeConversations(
  local: ChatConversation[],
  remote: RemoteConversationSummary[],
): ChatConversation[] {
  const localById = new Map(local.map((c) => [c.id, c]))
  const remoteIds = new Set(remote.map((c) => c.id))

  const merged = remote.map<ChatConversation>((summary) => {
    const cached = localById.get(summary.id)
    const isFresh = cached && cached.isLoaded !== false && cached.updatedAt >= summary.updatedAt

    if (cached && isFresh) {
      return { ...cached, title: summary.title || cached.title, preview: summary.preview }
    }

    return {
      id: summary.id,
      title: summary.title || cached?.title || DEFAULT_CONVERSATION_TITLE,
      preview: summary.preview,
      createdAt: summary.createdAt || cached?.createdAt || Date.now(),
      updatedAt: summary.updatedAt,
      messages: cached?.messages ?? [],
      isLoaded: false,
    }
  })

  const localOnly = local.filter((c) => !remoteIds.has(c.id) && !isPersistedRemotely(c))

  return [...localOnly, ...merged]
}

export function sortConversations(conversations: ChatConversation[]) {
  return [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)
}
