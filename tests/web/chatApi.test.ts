import { afterEach, describe, expect, it, vi } from "vitest"
import { CLIENT_LIMITS, RateLimitError, sendChatMessage, trimHistory } from "@/services/chat/chatApi"
import { ApiError, buildApiUrl } from "@/services/chat/apiClient"
import { deleteConversation, fetchConversation, listConversations } from "@/services/chat/conversationsApi"
import { CHAT_LIMITS, PROVIDER_MODELS as CHAT_PROVIDER_MODELS } from "../../api/_modules/chat/domain/chat.limits"
import { MODEL_OPTIONS } from "@/services/chat/models"

function ndjsonResponse(lines: unknown[], splitEvery = 5) {
  const text = lines.map((line) => JSON.stringify(line)).join("\n") + "\n"
  const encoder = new TextEncoder()
  const pieces = text.match(new RegExp(`[\\s\\S]{1,${splitEvery}}`, "g")) ?? []
  return new Response(
    new ReadableStream({
      start(controller) {
        pieces.forEach((piece) => controller.enqueue(encoder.encode(piece)))
        controller.close()
      },
    }),
    { status: 200, headers: { "Content-Type": "application/x-ndjson" } },
  )
}

function mockFetch(response: Response | (() => Response | Promise<Response>)) {
  const fn = vi.fn(async () => (typeof response === "function" ? response() : response))
  vi.stubGlobal("fetch", fn)
  return fn
}

const base = { messages: [{ role: "user" as const, content: "Hola" }], conversationId: "c1", idToken: "tok" }

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("buildApiUrl", () => {
  it("supports base URLs with or without /api", () => {
    expect(buildApiUrl("chat", "https://zen.vercel.app")).toBe("https://zen.vercel.app/api/chat")
    expect(buildApiUrl("chat", "https://zen.vercel.app/")).toBe("https://zen.vercel.app/api/chat")
    expect(buildApiUrl("conversations?id=1", "https://zen.vercel.app/api/")).toBe("https://zen.vercel.app/api/conversations?id=1")
  })
})

describe("trimHistory", () => {
  it("keeps recent messages within the client limits (which are below the server's)", () => {
    expect(CLIENT_LIMITS.maxHistoryMessages).toBeLessThan(CHAT_LIMITS.maxMessages)
    expect(CLIENT_LIMITS.maxHistoryChars).toBeLessThan(CHAT_LIMITS.maxTotalChars)
    expect(CLIENT_LIMITS.maxMessageChars).toBeLessThanOrEqual(CHAT_LIMITS.maxMessageChars)

    const many = Array.from({ length: 50 }, (_, i) => ({
      role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      content: `m${i}`,
    }))
    many.push({ role: "user", content: "last" })
    const trimmed = trimHistory(many)
    expect(trimmed.length).toBeLessThanOrEqual(CLIENT_LIMITS.maxHistoryMessages)
    expect(trimmed.at(-1)?.content).toBe("last")
    expect(trimmed[0]?.role).toBe("user")
  })

  it("respects the character budget and skips empty messages", () => {
    const big = "x".repeat(7_000)
    const history = Array.from({ length: 10 }, (_, i) => ({
      role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      content: big,
    }))
    history.push({ role: "assistant", content: "" }, { role: "user", content: "q" })
    const trimmed = trimHistory(history)
    expect(trimmed.reduce((n, m) => n + m.content.length, 0)).toBeLessThanOrEqual(CLIENT_LIMITS.maxHistoryChars)
    expect(trimmed.every((m) => m.content.length > 0)).toBe(true)
  })
})

describe("sendChatMessage", () => {
  it("streams deltas and resolves with the final message", async () => {
    const fetchFn = mockFetch(ndjsonResponse([
      { type: "delta", content: "Hola" },
      { type: "delta", content: " 👋 qué tal" },
      { type: "done", message: { role: "assistant", content: "Hola 👋 qué tal" }, provider: "groq", model: "m" },
    ]))
    const deltas: string[] = []
    const result = await sendChatMessage({ ...base, onDelta: (d) => deltas.push(d) })

    expect(deltas).toEqual(["Hola", " 👋 qué tal"])
    expect(result.message.content).toBe("Hola 👋 qué tal")

    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toMatch(/\/api\/chat$/)
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok")
    expect(JSON.parse(init.body as string)).toMatchObject({ conversationId: "c1", stream: true })
  })

  it("throws the server message on an error event", async () => {
    mockFetch(ndjsonResponse([{ type: "delta", content: "a" }, { type: "error", status: 502, error: "Provider down" }]))
    await expect(sendChatMessage(base)).rejects.toMatchObject({ message: "Provider down", status: 502 })
  })

  it("sends the selected provider and model, and only those the server allows", async () => {
    const fetchMock = mockFetch(ndjsonResponse([
      { type: "done", message: { role: "assistant", content: "ok" }, provider: "cerebras", model: "gpt-oss-120b" },
    ]))
    await sendChatMessage({ ...base, provider: "cerebras", model: "gpt-oss-120b" })
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    const body = JSON.parse(String(init.body))
    expect(body).toMatchObject({ provider: "cerebras", model: "gpt-oss-120b" })

    for (const option of MODEL_OPTIONS) {
      expect(CHAT_PROVIDER_MODELS[option.provider]).toContain(option.model)
    }
  })

  it("detects interrupted streams", async () => {
    mockFetch(ndjsonResponse([{ type: "delta", content: "a" }]))
    await expect(sendChatMessage(base)).rejects.toThrow(/se interrumpió/)
  })

  it("maps 429 to RateLimitError", async () => {
    mockFetch(new Response(JSON.stringify({ error: "Slow down", retryAfterSeconds: 42 }), { status: 429 }))
    const error = await sendChatMessage(base).catch((e) => e)
    expect(error).toBeInstanceOf(RateLimitError)
    expect(error).toMatchObject({ message: "Slow down", retryAfterSeconds: 42 })
  })

  it("handles non-JSON error bodies and network failures", async () => {
    mockFetch(new Response("<html>Bad gateway</html>", { status: 502 }))
    await expect(sendChatMessage(base)).rejects.toMatchObject({ status: 502, message: expect.stringContaining("No pudimos obtener") })

    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch") }))
    await expect(sendChatMessage(base)).rejects.toThrow(/Sin conexión/)
  })

  it("accepts a plain JSON (non-streamed) response", async () => {
    mockFetch(new Response(JSON.stringify({ message: { role: "assistant", content: "ok" }, provider: "groq", model: "m" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }))
    const onDelta = vi.fn()
    expect((await sendChatMessage({ ...base, onDelta })).message.content).toBe("ok")
    expect(onDelta).toHaveBeenCalledWith("ok")
  })
})

describe("conversations API", () => {
  it("lists, fetches and deletes", async () => {
    mockFetch(new Response(JSON.stringify({ conversations: [{ id: "a" }] })))
    expect(await listConversations("t")).toEqual([{ id: "a" }])

    mockFetch(new Response(JSON.stringify({ error: "nope" }), { status: 404 }))
    expect(await fetchConversation("a", "t")).toBeNull()

    const fetchFn = mockFetch(new Response(null, { status: 404 }))
    await expect(deleteConversation("a b", "t")).resolves.toBeUndefined()
    expect((fetchFn.mock.calls[0] as unknown as [string])[0]).toMatch(/conversations\?id=a%20b$/)

    mockFetch(new Response(JSON.stringify({ error: "Server" }), { status: 500 }))
    await expect(deleteConversation("a", "t")).rejects.toBeInstanceOf(ApiError)
  })
})
