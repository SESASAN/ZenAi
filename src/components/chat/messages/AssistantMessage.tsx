import type { Message } from "@/components/MessageBubble"
import { AssistantMarkdown } from "@/components/chat/markdown/AssistantMarkdown"
import { ROLE_LABELS } from "@/components/MessageBubble/MessageBubble.constants"
import styles from "@/components/chat/messages/ChatMessage.module.css"

type AssistantMessageModel = Message & { role: "assistant" }

interface AssistantMessageProps {
  message: AssistantMessageModel
}

export function AssistantMessage({ message }: AssistantMessageProps) {
  const bento = extractBentoFromContent(message.content)

  return (
    <div className={`${styles.row} ${styles.assistantRow}`}>
      <div className={`${styles.avatar} ${styles.assistantAvatar}`} aria-hidden="true">
        <span className={styles.avatarIcon}>✦</span>
      </div>

      <div className={`${styles.body} ${styles.assistantBody}`}>
        <article className={`${styles.bubble} ${styles.assistantBubble}`}>
          <AssistantMarkdown content={message.content} />

          {bento && (
            <div className={styles.bento} aria-label="Insights">
              {bento.items.map((item) => (
                <div key={item.title} className={styles.bentoCard}>
                  <h4 className={styles.bentoTitle}>{item.title}</h4>
                  <p className={styles.bentoText}>{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </article>

        <span className={styles.meta}>{ROLE_LABELS.assistant}</span>
      </div>
    </div>
  )
}

type BentoItem = { title: string; text: string }
type BentoModel = { items: BentoItem[] }

// Paso 4: Heurística simple. Más adelante lo convertimos en schema/markup explícito.
function extractBentoFromContent(content: string): BentoModel | null {
  const normalized = content.toLowerCase()

  const hasComparison = normalized.includes("standard") && normalized.includes("topological")
  const hasTwoBullets = (content.match(/\n\s*[-*]\s+/g) ?? []).length >= 2

  if (!hasComparison && !hasTwoBullets) {
    return null
  }

  // Versión 1: si detectamos comparación (como en el mock), mostramos dos cards fijas.
  if (hasComparison) {
    return {
      items: [
        {
          title: "Standard Qubits",
          text: "Susceptible to local noise. Information is stored in individual particle states."
        },
        {
          title: "Topological Qubits",
          text: "Protected by the global structure. Information is stored in the topology of the braid."
        }
      ]
    }
  }

  return null
}
