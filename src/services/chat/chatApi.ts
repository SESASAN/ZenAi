import type { Message } from "@/components/MessageBubble"

type ChatApiRequest = {
  provider?: "groq" | "cerebras"
  conversationId?: string
  messages: Array<{
    role: "user" | "assistant"
    content: string
  }>
}

type ChatApiResponse = {
  message: {
    role: "assistant"
    content: string
  }
  provider: "groq" | "cerebras"
  model: string
}

type ChatApiError = {
  error?: string
  retryAfterSeconds?: number
}

export class RateLimitError extends Error {
  readonly retryAfterSeconds: number

  constructor(retryAfterSeconds: number) {
    super("You've reached today's request limit. Please try again later.")
    this.name = "RateLimitError"
    this.retryAfterSeconds = retryAfterSeconds
  }
}

/**
 * Prefer same-origin by default.
 * - When running via `vercel dev --listen 3001`, the UI and `/chat` are served from the same origin.
 * - Hardcoding `127.0.0.1` can accidentally make requests cross-origin vs `localhost`,
 *   triggering CORS/preflight and making failures harder to debug.
 */
const DEFAULT_CHAT_API_URL =
  typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:3001"

function getChatApiBaseUrl() {
  return import.meta.env.VITE_CHAT_API_URL?.trim() || DEFAULT_CHAT_API_URL
}

function buildChatEndpoint(baseUrl: string) {
  const normalized = baseUrl.replace(/\/+$/, "")
  // Support both styles:
  // - VITE_CHAT_API_URL=https://<host>           -> use /api/chat
  // - VITE_CHAT_API_URL=https://<host>/api       -> use /api/chat via /chat suffix
  return normalized.endsWith("/api") ? `${normalized}/chat` : `${normalized}/api/chat`
}

export async function sendChatMessage(
  messages: Message[],
  conversationId?: string,
  idToken?: string
): Promise<ChatApiResponse> {
  const payload: ChatApiRequest = {
    provider: "groq",
    conversationId,
    messages: messages.map(({ role, content }) => ({ role, content }))
  }

  let response: Response

  try {
    response = await fetch(buildChatEndpoint(getChatApiBaseUrl()), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify(payload)
    })
  } catch {
    throw new Error("Connection lost")
  }

  // Avoid crashing the UI when the response has an empty body or non-JSON payload (proxy errors, etc).
  const rawText = await response.text()
  let data: ChatApiResponse | ChatApiError = {}
  try {
    data = rawText ? (JSON.parse(rawText) as ChatApiResponse | ChatApiError) : {}
  } catch {
    data = { error: rawText || "Invalid JSON response from server." }
  }

  if (!response.ok) {
    const errorData = data as ChatApiError
    if (response.status === 429 && errorData.retryAfterSeconds) {
      throw new RateLimitError(errorData.retryAfterSeconds)
    }
    const errorMessage = errorData.error || undefined
    throw new Error(errorMessage || "Couldn't get a response from the assistant.")
  }

  return data as ChatApiResponse
}
