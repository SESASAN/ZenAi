import type { Message } from "@/components/MessageBubble"
import { apiFetch, ApiError, errorFromPayload, readJson } from "./apiClient"

export { ApiError, RateLimitError } from "./apiClient"

export type ChatApiResponse = {
  message: {
    role: "assistant"
    content: string
  }
  provider: "groq" | "cerebras"
  model: string
}

type StreamEvent =
  | { type: "delta"; content: string }
  | ({ type: "done" } & ChatApiResponse)
  | { type: "error"; status: number; error: string; retryAfterSeconds?: number }

/** Must stay below the server limits in api/_modules/chat/domain/chat.limits.ts */
export const CLIENT_LIMITS = {
  maxHistoryMessages: 30,
  maxHistoryChars: 40_000,
  maxMessageChars: 8_000,
} as const

const FALLBACK_ERROR = "No pudimos obtener una respuesta del modelo."

/**
 * Keeps the most recent messages that fit the limits, so long conversations keep working.
 * The history never starts with an assistant message.
 */
export function trimHistory(messages: Pick<Message, "role" | "content">[]) {
  const result: Array<Pick<Message, "role" | "content">> = []
  let totalChars = 0

  for (let i = messages.length - 1; i >= 0; i--) {
    const { role, content } = messages[i]!
    if (!content.trim()) continue
    if (result.length >= CLIENT_LIMITS.maxHistoryMessages) break
    if (totalChars + content.length > CLIENT_LIMITS.maxHistoryChars && result.length > 0) break
    totalChars += content.length
    result.unshift({ role, content })
  }

  while (result.length > 1 && result[0]!.role === "assistant") result.shift()
  return result
}

async function* readNdjson(body: ReadableStream<Uint8Array>): AsyncGenerator<StreamEvent> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value, { stream: !done })

    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""
    for (const line of lines) {
      if (line.trim()) yield JSON.parse(line) as StreamEvent
    }

    if (done) {
      if (buffer.trim()) yield JSON.parse(buffer) as StreamEvent
      return
    }
  }
}

export async function sendChatMessage({
  messages,
  conversationId,
  idToken,
  onDelta,
  signal,
  provider,
  model,
}: {
  messages: Pick<Message, "role" | "content">[]
  conversationId: string
  idToken: string
  onDelta?: (delta: string) => void
  signal?: AbortSignal
  /** Optional; the server falls back to its default model. */
  provider?: "groq" | "cerebras"
  model?: string
}): Promise<ChatApiResponse> {
  const response = await apiFetch("chat", {
    method: "POST",
    idToken,
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversationId,
      stream: true,
      ...(provider && model ? { provider, model } : {}),
      messages: trimHistory(messages),
    }),
  })

  const contentType = response.headers.get("content-type") ?? ""

  if (response.ok && contentType.includes("ndjson") && response.body) {
    for await (const event of readNdjson(response.body)) {
      if (event.type === "delta") onDelta?.(event.content)
      else if (event.type === "done") return event
      else if (event.type === "error") throw errorFromPayload(event.status, event, FALLBACK_ERROR)
    }
    throw new ApiError("La respuesta se interrumpió. Inténtalo de nuevo.", 0)
  }

  const data = await readJson<ChatApiResponse>(response)
  if (!response.ok) {
    throw errorFromPayload(response.status, data, FALLBACK_ERROR)
  }

  const completion = data as ChatApiResponse
  if (!completion.message?.content) throw new ApiError(FALLBACK_ERROR, response.status)
  onDelta?.(completion.message.content)
  return completion
}
