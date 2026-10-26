/**
 * Models offered in the UI. Must stay in sync with PROVIDER_MODELS in
 * api/_modules/chat/domain/chat.limits.ts (the server rejects anything else).
 */
export type ChatProvider = "groq" | "cerebras"

export type ModelOption = {
  provider: ChatProvider
  model: string
  label: string
  description: string
}

export const PROVIDER_LABELS: Record<ChatProvider, string> = {
  groq: "Groq",
  cerebras: "Cerebras",
}

export const MODEL_OPTIONS: ModelOption[] = [
  {
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    label: "Llama 3.3 70B",
    description: "Respuestas más completas · predeterminado",
  },
  {
    provider: "groq",
    model: "llama-3.1-8b-instant",
    label: "Llama 3.1 8B",
    description: "Más rápido para preguntas cortas",
  },
  {
    provider: "cerebras",
    model: "gpt-oss-120b",
    label: "GPT‑OSS 120B",
    description: "Razonamiento en tareas largas",
  },
  {
    provider: "cerebras",
    model: "llama3.1-8b",
    label: "Llama 3.1 8B",
    description: "Rápido, alternativa si Groq está saturado",
  },
]

export const DEFAULT_MODEL = MODEL_OPTIONS[0]!

const MODEL_KEY = "zenai-model"

export function modelKey(option: Pick<ModelOption, "provider" | "model">) {
  return `${option.provider}:${option.model}`
}

export function findModel(key: string | null | undefined) {
  return MODEL_OPTIONS.find((option) => modelKey(option) === key) ?? null
}

export function loadPreferredModel(): ModelOption {
  try {
    return findModel(localStorage.getItem(MODEL_KEY)) ?? DEFAULT_MODEL
  } catch {
    return DEFAULT_MODEL
  }
}

export function savePreferredModel(option: ModelOption) {
  try {
    localStorage.setItem(MODEL_KEY, modelKey(option))
  } catch {
    // Storage unavailable; the choice lasts for this session only.
  }
}
