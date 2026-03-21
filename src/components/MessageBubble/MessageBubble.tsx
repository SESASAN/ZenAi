import { ROLE_LABELS } from "./MessageBubble.constants"
import type { MessageBubbleProps } from "./MessageBubble.types"
import styles from "./MessageBubble.module.css"

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === "user"

    const rowClassName = [
        styles.row,
        isUser ? styles.userRow : styles.assistantRow
    ].join(" ")

    const bubbleClassName = [
        styles.bubble,
        isUser ? styles.userBubble : styles.assistantBubble
    ].join(" ")

    return (
        <div className={rowClassName}>
            <article className={bubbleClassName}>
                <div className={styles.meta}>{ROLE_LABELS[message.role]}</div>
                <p className={styles.content}>{message.content}</p>
            </article>
        </div>
    )
}