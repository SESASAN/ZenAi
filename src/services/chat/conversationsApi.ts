import { apiFetch, errorFromPayload, readJson } from "./apiClient"

export type RemoteConversationSummary = {
  id: string
  title: string
  preview: string
  createdAt: number
  updatedAt: number
}

export type RemoteConversation = RemoteConversationSummary & {
  messages: Array<{ id: string; role: "user" | "assistant"; content: string; createdAt: number }>
}

export async function listConversations(idToken: string): Promise<RemoteConversationSummary[]> {
  const response = await apiFetch("conversations", { method: "GET", idToken })
  const data = await readJson<{ conversations: RemoteConversationSummary[] }>(response)
  if (!response.ok) throw errorFromPayload(response.status, data, "No pudimos cargar tus conversaciones.")
  return (data as { conversations?: RemoteConversationSummary[] }).conversations ?? []
}

/** Returns null when the conversation doesn't exist on the server. */
export async function fetchConversation(id: string, idToken: string): Promise<RemoteConversation | null> {
  const response = await apiFetch(`conversations?id=${encodeURIComponent(id)}`, { method: "GET", idToken })
  if (response.status === 404) return null
  const data = await readJson<{ conversation: RemoteConversation }>(response)
  if (!response.ok) throw errorFromPayload(response.status, data, "No pudimos cargar esta conversación.")
  return (data as { conversation: RemoteConversation }).conversation
}

/** Deleting a conversation that doesn't exist is treated as success. */
export async function deleteConversation(id: string, idToken: string): Promise<void> {
  const response = await apiFetch(`conversations?id=${encodeURIComponent(id)}`, { method: "DELETE", idToken })
  if (response.ok || response.status === 404) return
  const data = await readJson(response)
  throw errorFromPayload(response.status, data, "No pudimos borrar la conversación.")
}
