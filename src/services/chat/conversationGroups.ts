import type { ChatConversation } from "./chatStorage"

const DAY = 24 * 60 * 60 * 1000

export type ConversationGroup = { label: string; items: ChatConversation[] }

/** Groups conversations (already sorted, newest first) into Hoy / Ayer / Últimos 7 días / Anteriores. */
export function groupConversationsByDate(conversations: ChatConversation[], now = Date.now()) {
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const today = startOfToday.getTime()

  const buckets: Array<[string, (t: number) => boolean]> = [
    ["Hoy", (t) => t >= today],
    ["Ayer", (t) => t >= today - DAY],
    ["Últimos 7 días", (t) => t >= today - 6 * DAY],
    ["Anteriores", () => true],
  ]

  const groups: ConversationGroup[] = []
  for (const conversation of conversations) {
    const label = buckets.find(([, test]) => test(conversation.updatedAt))![0]
    const group = groups.find((g) => g.label === label)
    if (group) group.items.push(conversation)
    else groups.push({ label, items: [conversation] })
  }
  return groups
}

/** "11:44", "Ayer", "jue", "12 oct". */
export function formatConversationTime(timestamp: number, now = Date.now()) {
  const date = new Date(timestamp)
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const diff = startOfToday.getTime() - timestamp

  if (diff <= 0) return date.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })
  if (diff <= DAY) return "Ayer"
  if (diff <= 6 * DAY) return date.toLocaleDateString("es", { weekday: "short" })
  return date.toLocaleDateString("es", { day: "numeric", month: "short" })
}
