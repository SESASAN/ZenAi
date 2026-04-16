import type { Message } from "@/components/MessageBubble"
import { ROLE_LABELS } from "@/components/MessageBubble/MessageBubble.constants"
import styles from "@/components/chat/messages/ChatMessage.module.css"

type UserMessageModel = Message & { role: "user" }

interface UserMessageProps {
  message: UserMessageModel
  userInitial?: string
}

export function UserMessage({ message, userInitial }: UserMessageProps) {
  return (
    <div className={`${styles.row} ${styles.userRow}`}>
      <div className={`${styles.body} ${styles.userBody}`}>
        <article className={`${styles.bubble} ${styles.userBubble}`}>
          <p className={styles.userText}>{message.content}</p>
        </article>

        <span className={styles.meta}>{ROLE_LABELS.user}</span>
      </div>

      <div className={`${styles.avatar} ${styles.userAvatar}`} aria-hidden="true">
        <span className={styles.avatarIcon}>{(userInitial ?? "U").slice(0, 1).toUpperCase()}</span>
      </div>
    </div>
  )
}
