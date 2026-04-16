import { useState } from "react"
import type { Message } from "@/components/MessageBubble"
import { ROLE_LABELS } from "@/components/MessageBubble/MessageBubble.constants"
import styles from "@/components/chat/messages/ChatMessage.module.css"

type UserMessageModel = Message & { role: "user" }

interface UserMessageProps {
  message: UserMessageModel
  userInitial?: string
  userAvatarUrl?: string | null
}

export function UserMessage({ message, userInitial, userAvatarUrl }: UserMessageProps) {
  const [isImageValid, setIsImageValid] = useState(true)
  const initial = (userInitial ?? "U").slice(0, 1).toUpperCase()
  const showImage = Boolean(userAvatarUrl) && isImageValid

  return (
    <div className={`${styles.row} ${styles.userRow}`}>
      <div className={`${styles.body} ${styles.userBody}`}>
        <article className={`${styles.bubble} ${styles.userBubble}`}>
          <p className={styles.userText}>{message.content}</p>
        </article>

        <span className={styles.meta}>{ROLE_LABELS.user}</span>
      </div>

      <div className={`${styles.avatar} ${styles.userAvatar}`} aria-hidden="true">
        {showImage ? (
          <img
            className={styles.avatarImage}
            src={userAvatarUrl ?? ""}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setIsImageValid(false)}
          />
        ) : (
          <span className={styles.avatarIcon}>{initial}</span>
        )}
      </div>
    </div>
  )
}
