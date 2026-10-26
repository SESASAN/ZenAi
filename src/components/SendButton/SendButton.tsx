import { Icon } from "@/components/ui/Icon"
import type { SendButtonProps } from "./SendButton.types"
import styles from "./SendButton.module.css"

/** Round send button. While a reply is generating it shows a spinner and stays disabled. */
export function SendButton({ label, onClick, disabled = false, isBusy = false, countdown, type = "button" }: SendButtonProps) {
  if (countdown) {
    return (
      <button className={`${styles.button} ${styles.countdown}`} type={type} disabled aria-label={label}>
        {countdown}
      </button>
    )
  }

  return (
    <button
      className={`${styles.button} ${isBusy ? styles.busy : ""}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
      aria-label={label}
    >
      {isBusy ? <span className={styles.spinner} aria-hidden="true" /> : <Icon name="send" size={18} strokeWidth={2.2} />}
    </button>
  )
}
