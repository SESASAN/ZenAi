/**
 * Base URL of the serverless backend.
 * Prefer same-origin by default (e.g. `vercel dev --listen 3001` serves UI and API together).
 */
const DEFAULT_API_BASE_URL =
  typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:3001"

export function getApiBaseUrl() {
  return import.meta.env.VITE_CHAT_API_URL?.trim() || DEFAULT_API_BASE_URL
}

/**
 * Supports both styles:
 * - VITE_CHAT_API_URL=https://<host>      -> https://<host>/api/<path>
 * - VITE_CHAT_API_URL=https://<host>/api  -> https://<host>/api/<path>
 */
export function buildApiUrl(path: string, baseUrl = getApiBaseUrl()) {
  const normalized = baseUrl.replace(/\/+$/, "")
  const apiBase = normalized.endsWith("/api") ? normalized : `${normalized}/api`
  return `${apiBase}/${path.replace(/^\/+/, "")}`
}

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export class RateLimitError extends ApiError {
  readonly retryAfterSeconds: number

  constructor(message: string, retryAfterSeconds: number) {
    super(message, 429)
    this.name = "RateLimitError"
    this.retryAfterSeconds = retryAfterSeconds
  }
}

type ErrorPayload = { error?: string; retryAfterSeconds?: number }

export function errorFromPayload(status: number, payload: unknown, fallback: string) {
  const { error, retryAfterSeconds } = (payload ?? {}) as ErrorPayload
  const message = typeof error === "string" && error ? error : fallback
  if (status === 429) {
    return new RateLimitError(message, typeof retryAfterSeconds === "number" ? retryAfterSeconds : 60)
  }
  return new ApiError(message, status)
}

/** Reads a JSON body without crashing on empty or non-JSON responses (proxy errors, etc). */
export async function readJson<T>(response: Response): Promise<T | ErrorPayload> {
  const rawText = await response.text()
  if (!rawText) return {}
  try {
    return JSON.parse(rawText) as T
  } catch {
    return { error: response.ok ? "El servidor respondió con un formato inesperado." : undefined }
  }
}

export async function apiFetch(path: string, init: RequestInit & { idToken: string }) {
  const { idToken, headers, ...rest } = init
  try {
    return await fetch(buildApiUrl(path), {
      ...rest,
      headers: { ...headers, Authorization: `Bearer ${idToken}` },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error
    throw new ApiError("Sin conexión a internet. Revisa tu red y vuelve a intentarlo.", 0)
  }
}
