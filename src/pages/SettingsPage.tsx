import { useState } from "react"
import { SettingsLayout, SettingsRow } from "@/components/site/SettingsLayout"
import { AccentPicker } from "@/components/ThemeToggle"
import { useFavicon } from "@/components/useFavicon"
import { useTheme } from "@/components/useTheme"
import {
  MODEL_OPTIONS,
  PROVIDER_LABELS,
  findModel,
  loadPreferredModel,
  modelKey,
  savePreferredModel,
} from "@/services/chat/models"
import { CLIENT_LIMITS } from "@/services/chat/chatApi"

export function SettingsPage() {
  const { themeId } = useTheme()
  useFavicon(themeId)
  const [modelValue, setModelValue] = useState(() => modelKey(loadPreferredModel()))
  const [savedNote, setSavedNote] = useState(false)

  return (
    <SettingsLayout title="Preferencias">
      <h2 className="settings__section">Apariencia</h2>
      <SettingsRow
        title="Color de acento"
        description="Cambia el color del botón enviar, el foco y el logo. El fondo siempre es neutro."
      >
        <AccentPicker />
      </SettingsRow>

      <h2 className="settings__section">Modelo</h2>
      <SettingsRow
        title="Modelo predeterminado"
        description={savedNote ? "Guardado. Se usará en tus próximos mensajes." : "Se usa al abrir el chat. También puedes cambiarlo desde el encabezado."}
      >
        <label className="sr-only" htmlFor="default-model">Modelo predeterminado</label>
        <select
          id="default-model"
          className="select"
          value={modelValue}
          onChange={(event) => {
            const option = findModel(event.target.value)
            if (!option) return
            setModelValue(event.target.value)
            savePreferredModel(option)
            setSavedNote(true)
          }}
        >
          {(["groq", "cerebras"] as const).map((provider) => (
            <optgroup key={provider} label={PROVIDER_LABELS[provider]}>
              {MODEL_OPTIONS.filter((o) => o.provider === provider).map((option) => (
                <option key={modelKey(option)} value={modelKey(option)}>
                  {option.label} · {PROVIDER_LABELS[provider]}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </SettingsRow>
      <SettingsRow
        title="Límites de uso"
        description={`Por defecto, hasta 10 mensajes por minuto y 200 por día. Cada mensaje admite hasta ${CLIENT_LIMITS.maxMessageChars.toLocaleString("es")} caracteres.`}
      />
    </SettingsLayout>
  )
}
