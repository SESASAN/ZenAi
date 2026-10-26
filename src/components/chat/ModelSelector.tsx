import { useEffect, useId, useRef, useState } from "react"

import { Icon } from "@/components/ui/Icon"
import {
  MODEL_OPTIONS,
  PROVIDER_LABELS,
  modelKey,
  type ChatProvider,
  type ModelOption,
} from "@/services/chat/models"

interface ModelSelectorProps {
  value: ModelOption
  onChange: (option: ModelOption) => void
  disabled?: boolean
}

const PROVIDERS: ChatProvider[] = ["groq", "cerebras"]

/** Header dropdown on desktop, bottom sheet on phones (same markup, CSS decides). */
export function ModelSelector({ value, onChange, disabled = false }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const listId = useId()
  const currentKey = modelKey(value)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (ev: PointerEvent) => {
      if (rootRef.current?.contains(ev.target as Node)) return
      setOpen(false)
    }
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setOpen(false)
    }
    window.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="modelSelector">
      <button
        type="button"
        className={`modelSelector__trigger ${open ? "modelSelector__trigger--open" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Cambiar modelo, actual ${value.label} (${PROVIDER_LABELS[value.provider]})`}
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
      >
        <span>{value.label}</span>
        <Icon name={open ? "chevronUp" : "chevronDown"} size={14} strokeWidth={2} />
      </button>

      {open ? (
        <>
          <div className="modelSelector__scrim" aria-hidden="true" onClick={() => setOpen(false)} />
          <div id={listId} className="modelSelector__panel" role="dialog" aria-label="Elegir modelo">
            <div className="modelSelector__handle" aria-hidden="true" />
            <p className="modelSelector__title">Modelo</p>
            <p className="modelSelector__hint">Aplica a los siguientes mensajes.</p>
            <div role="radiogroup" aria-label="Modelos disponibles">
              {PROVIDERS.map((provider) => (
                <div key={provider} className="modelSelector__group">
                  <p className="modelSelector__provider">{PROVIDER_LABELS[provider]}</p>
                  {MODEL_OPTIONS.filter((o) => o.provider === provider).map((option) => {
                    const selected = modelKey(option) === currentKey
                    return (
                      <button
                        key={modelKey(option)}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={`modelSelector__option ${selected ? "modelSelector__option--selected" : ""}`}
                        onClick={() => {
                          onChange(option)
                          setOpen(false)
                        }}
                      >
                        <span className="modelSelector__optionCopy">
                          <span className="modelSelector__optionName">{option.label}</span>
                          <span className="modelSelector__optionDesc">{option.description}</span>
                        </span>
                        {selected ? <Icon name="check" size={18} strokeWidth={2.2} className="modelSelector__check" /> : null}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
