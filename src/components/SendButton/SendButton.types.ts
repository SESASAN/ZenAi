export type SendButtonVariant = "primary" | "secondary"

export interface SendButtonProps {
    label: string
    onClick?: () => void
    disabled?: boolean
    variant?: SendButtonVariant
    type?: "button" | "submit" | "reset"
}