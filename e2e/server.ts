/**
 * E2E server: serves the production build exactly like GitHub Pages (under /ZenAi/, unknown paths -> 404.html)
 * and mounts the real API handlers with in-memory storage and a fake streaming LLM provider.
 */
import { createServer, type IncomingMessage } from "node:http"
import { readFile, stat } from "node:fs/promises"
import path from "node:path"

import { InvalidTokenError } from "../api/_modules/auth/domain/auth.errors"
import { handleChatHttp, type ChatHttpDependencies } from "../api/_modules/chat/presentation/http/chat.http"
import { handleConversationsHttp } from "../api/_modules/conversations/presentation/http/conversations.http"
import { openChatCompletionStream } from "../api/_modules/chat/infrastructure/llm/requestChatCompletion"
import { InMemoryConversationRepository } from "../api/_modules/conversations/infrastructure/inMemoryConversationRepository"
import { InMemoryRateLimiter } from "../api/_modules/rateLimit/infrastructure/inMemoryRateLimiter"

const PORT = Number(process.env.E2E_PORT ?? 4173)
const DIST = path.resolve(import.meta.dirname, "../dist-e2e")
const BASE = "/ZenAi/"

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
}

/** Fake ID tokens are unsigned JWTs; the payload's `user_id` is the uid. */
async function verifyToken(token: string) {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"))
    if (typeof payload.user_id !== "string") throw new Error("no uid")
    return { uid: payload.user_id as string }
  } catch {
    throw new InvalidTokenError()
  }
}

/** Streams "Echo: <question>" word by word, like Groq's SSE API. */
async function fakeProviderFetch(_url: string, init?: RequestInit) {
  const body = JSON.parse(String(init?.body ?? "{}"))
  const question: string = body.messages?.at(-1)?.content ?? ""
  if (question.includes("[provider-error]")) return new Response("upstream exploded", { status: 500 })

  const words = `Echo: ${question}`.split(/(?<= )/)
  const encoder = new TextEncoder()
  return new Response(
    new ReadableStream({
      async start(controller) {
        for (const word of words) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: word } }] })}\n\n`))
          await new Promise((resolve) => setTimeout(resolve, 40))
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      },
    }),
    { status: 200, headers: { "Content-Type": "text/event-stream" } },
  )
}

const deps: ChatHttpDependencies = {
  verifyToken,
  conversations: new InMemoryConversationRepository(),
  rateLimiter: new InMemoryRateLimiter({ perMinute: Number(process.env.E2E_RATE_PER_MINUTE ?? 50), perDay: 1000 }),
  openStream: (request, signal) =>
    openChatCompletionStream(request, { fetchImpl: fakeProviderFetch, signal, env: { GROQ_API_KEY: "e2e" } }),
  log: () => undefined,
}

async function readBody(req: IncomingMessage) {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks).toString("utf8")
}

async function fileExists(file: string) {
  try {
    return (await stat(file)).isFile()
  } catch {
    return false
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`)

  if (url.pathname === "/api/chat" || url.pathname === "/api/conversations") {
    const request = { method: req.method, url: req.url, headers: req.headers, body: await readBody(req) }
    if (url.pathname === "/api/chat") await handleChatHttp(request, res, deps)
    else await handleConversationsHttp(request, res, deps)
    return
  }

  if (url.pathname.startsWith(BASE)) {
    const relative = url.pathname.slice(BASE.length) || "index.html"
    const file = path.join(DIST, relative)
    if (file.startsWith(DIST) && (await fileExists(file))) {
      res.writeHead(200, { "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream" })
      res.end(await readFile(file))
      return
    }
  }

  // GitHub Pages behavior: unknown paths get 404.html with a 404 status.
  res.writeHead(404, { "Content-Type": MIME[".html"] })
  res.end(await readFile(path.join(DIST, "404.html")))
}).listen(PORT, () => {
  console.log(`e2e server on http://localhost:${PORT}${BASE}`)
})
