import { useState } from "react"
import type { Message } from "@/components/MessageBubble"
import { AssistantMarkdown } from "@/components/chat/markdown/AssistantMarkdown"
import { Icon } from "@/components/ui/Icon"
import { ZenMark } from "@/components/ui/ZenMark"
import styles from "@/components/chat/messages/ChatMessage.module.css"

type AssistantMessageModel = Message & { role: "assistant" }

interface AssistantMessageProps {
  message: AssistantMessageModel
  isStreaming?: boolean
}

export function AssistantMessage({ message, isStreaming = false }: AssistantMessageProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className={styles.assistantRow}>
      <span className={styles.mark} aria-hidden="true">
        <ZenMark size={15} strokeWidth={2.6} />
      </span>

      <div className={styles.assistantBody}>
        <span className="sr-only">ZenAI:</span>
        <div className={`${styles.assistantText} ${isStreaming ? styles.streaming : ""}`}>
          <AssistantMarkdown content={message.content} />
        </div>

        {!isStreaming ? (
          <div className={styles.actions}>
            <button className="iconBtn" type="button" onClick={handleCopy} aria-label={copied ? "Respuesta copiada" : "Copiar respuesta"}>
              <Icon name={copied ? "check" : "copy"} size={16} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
