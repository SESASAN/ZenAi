export interface SendButtonProps {
    /** Accessible name (the button only shows an icon). */
    label: string
    onClick?: () => void
    disabled?: boolean
    /** A reply is being generated. */
    isBusy?: boolean
    /** Rate-limit countdown text (e.g. "24s"); replaces the icon and disables the button. */
    countdown?: string
    type?: "button" | "submit" | "reset"
}
