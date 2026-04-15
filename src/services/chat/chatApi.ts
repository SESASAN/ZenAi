import type { Message } from "@/components/MessageBubble"

type ChatApiRequest = {
  provider?: "groq" | "cerebras"
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

const DEFAULT_CHAT_API_URL = "http://127.0.0.1:3001"

function getChatApiBaseUrl() {
  return import.meta.env.VITE_CHAT_API_URL?.trim() || DEFAULT_CHAT_API_URL
}

export async function sendChatMessage(messages: Message[]): Promise<ChatApiResponse> {
  const payload: ChatApiRequest = {
    provider: "groq",
    messages: messages.map(({ role, content }) => ({ role, content }))
  }

  let response: Response

  try {
    response = await fetch(`${getChatApiBaseUrl()}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
  } catch {
    throw new Error(
      "No se pudo conectar con el backend local. Asegurate de ejecutar `npm run dev:local` dentro de `functions/`."
    )
  }

  const data = (await response.json()) as ChatApiResponse | { error?: string }

  if (!response.ok) {
    throw new Error(data.error || "No se pudo obtener respuesta del asistente.")
  }

  return data as ChatApiResponse
}
