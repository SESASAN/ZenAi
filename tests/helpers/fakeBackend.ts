import { vi } from "vitest"
import { handleChatHttp } from "../../api/_modules/chat/presentation/http/chat.http"
import { handleConversationsHttp } from "../../api/_modules/conversations/presentation/http/conversations.http"
import type { FetchLike } from "../../api/_modules/chat/infrastructure/llm/requestChatCompletion"
import { InMemoryConversationRepository } from "../../api/_modules/conversations/infrastructure/inMemoryConversationRepository"
import { makeChatDeps } from "./deps"
import { FakeResponse } from "./http"

/**
 * Routes the browser's fetch() to the real API handlers (in-memory storage + fake LLM provider),
 * so UI tests exercise the full client/server contract.
 */
export function installFakeBackend(options: { providerFetch?: FetchLike; perMinute?: number } = {}) {
  const conversations = new InMemoryConversationRepository()
  const { deps } = makeChatDeps({ conversations, fetchImpl: options.providerFetch, perMinute: options.perMinute })
  const requests: Array<{ method: string; path: string }> = []
  let failAll = false

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(String(input))
    const method = init.method ?? "GET"
    requests.push({ method, path: url.pathname + url.search })
    if (failAll) throw new TypeError("Failed to fetch")

    const headers = Object.fromEntries(
      Object.entries((init.headers ?? {}) as Record<string, string>).map(([k, v]) => [k.toLowerCase(), v]),
    )
    const req = { method, url: url.pathname + url.search, headers: { ...headers, origin: "http://localhost:3000" }, body: init.body }
    const res = new FakeResponse()

    if (url.pathname === "/api/chat") await handleChatHttp(req, res, deps)
    else if (url.pathname === "/api/conversations") await handleConversationsHttp(req, res, deps)
    else res.statusCode = 404

    const status = res.statusCode
    return new Response(status === 204 ? null : res.text, {
      status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "text/plain" },
    })
  })

  vi.stubGlobal("fetch", fetchMock)

  return {
    conversations,
    requests,
    fetchMock,
    setOffline(value: boolean) {
      failAll = value
    },
  }
}
