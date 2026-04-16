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
}

const DEFAULT_CHAT_API_URL = "http://127.0.0.1:3001"

function getChatApiBaseUrl() {
  return import.meta.env.VITE_CHAT_API_URL?.trim() || DEFAULT_CHAT_API_URL
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
    response = await fetch(`${getChatApiBaseUrl()}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
      },
      body: JSON.stringify(payload)
    })
  } catch {
    throw new Error("Conexión Perdida")
  }

  const data = (await response.json()) as ChatApiResponse | ChatApiError

  if (!response.ok) {
    const errorMessage = "error" in data ? data.error : undefined
    throw new Error(errorMessage || "No se pudo obtener respuesta del asistente.")
  }

  return data as ChatApiResponse
}
