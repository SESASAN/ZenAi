import { useState } from "react"
import { DEFAULT_VARIANT } from "./SendButton.constants"
import type { SendButtonProps } from "./SendButton.types"
import styles from "./SendButton.module.css"

export function SendButton({
    label,
    onClick,
    disabled = false,
    variant = DEFAULT_VARIANT,
    type = "button"
}: SendButtonProps) {
    const [pressed, setPressed] = useState(false)

    const handleClick = () => {
        setPressed(true)
        onClick?.()
        window.setTimeout(() => setPressed(false), 180)
    }

    const className = [
        styles.button,
        styles[variant],
        pressed ? styles.pressed : ""
    ].join(" ")

    return (
        <button
            className={className}
            onClick={handleClick}
            disabled={disabled}
            type={type}
        >
            {label}
        </button>
    )
}