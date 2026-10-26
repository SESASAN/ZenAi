import type { Message } from "@/components/MessageBubble"
import styles from "@/components/chat/messages/ChatMessage.module.css"

type UserMessageModel = Message & { role: "user" }

export function UserMessage({ message }: { message: UserMessageModel }) {
  return (
    <div className={styles.userRow}>
      <span className="sr-only">Tú:</span>
      <p className={styles.userBubble}>{message.content}</p>
    </div>
  )
}
