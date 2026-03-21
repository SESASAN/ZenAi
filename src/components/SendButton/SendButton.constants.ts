import type { SendButtonVariant } from "./SendButton.types"

export const DEFAULT_VARIANT: SendButtonVariant = "primary"

export const SEND_BUTTON_LABELS: Record<SendButtonVariant, string> = {
    primary: "Enviar",
    secondary: "Procesando..."
}