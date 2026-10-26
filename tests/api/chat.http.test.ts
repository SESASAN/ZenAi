import { describe, expect, it, vi } from "vitest";
import { handleChatHttp } from "../../api/_modules/chat/presentation/http/chat.http";
import { InMemoryConversationRepository } from "../../api/_modules/conversations/infrastructure/inMemoryConversationRepository";
import { FakeResponse, deltaChunk, makeRequest, sseResponse } from "../helpers/http";
import { makeChatDeps } from "../helpers/deps";

const conversationId = "11111111-2222-3333-4444-555555555555";

function chatRequest(body: Record<string, unknown>, headers?: Record<string, string>) {
  return makeRequest({
    body: { conversationId, messages: [{ role: "user", content: "Hola" }], ...body },
    ...(headers ? { headers } : {}),
  });
}

describe("POST /api/chat", () => {
  it("streams NDJSON deltas and a final done event", async () => {
    const { deps } = makeChatDeps();
    const res = new FakeResponse();
    await handleChatHttp(chatRequest({ stream: true }), res, deps);

    expect(res.statusCode).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/x-ndjson");
    expect(res.writableEnded).toBe(true);
    const events = res.events<{ type: string; content?: string; message?: { content: string } }>();
    expect(events.filter((e) => e.type === "delta").map((e) => e.content)).toEqual(["Hola", ", soy ZenAI."]);
    expect(events.at(-1)).toMatchObject({
      type: "done",
      message: { role: "assistant", content: "Hola, soy ZenAI." },
      provider: "groq",
      model: "llama-3.3-70b-versatile",
      persisted: true,
    });
  });

  it("returns plain JSON when stream is not requested", async () => {
    const { deps } = makeChatDeps();
    const res = new FakeResponse();
    await handleChatHttp(chatRequest({}), res, deps);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ message: { content: "Hola, soy ZenAI." } });
  });

  it("persists only the new exchange, not the whole history", async () => {
    const conversations = new InMemoryConversationRepository();
    const { deps } = makeChatDeps({ conversations });
    const history = [
      { role: "user", content: "Primera pregunta larga" },
      { role: "assistant", content: "Primera respuesta" },
      { role: "user", content: "Segunda" },
    ];
    await handleChatHttp(chatRequest({ messages: history }), new FakeResponse(), deps);

    const stored = await conversations.get("user-1", conversationId);
    expect(stored?.title).toBe("Primera pregunta larga");
    expect(stored?.messages.map((m) => [m.role, m.content])).toEqual([
      ["user", "Segunda"],
      ["assistant", "Hola, soy ZenAI."],
    ]);
  });

  it("keeps users' data isolated", async () => {
    const conversations = new InMemoryConversationRepository();
    const { deps } = makeChatDeps({ conversations });
    await handleChatHttp(chatRequest({}), new FakeResponse(), deps);
    expect(await conversations.list("user-2")).toEqual([]);
    expect(await conversations.list("user-1")).toHaveLength(1);
  });

  it("requires a valid token", async () => {
    const { deps } = makeChatDeps();
    const missing = new FakeResponse();
    await handleChatHttp(chatRequest({}, { origin: "https://sesasan.github.io" }), missing, deps);
    expect(missing.statusCode).toBe(401);

    const invalid = new FakeResponse();
    await handleChatHttp(chatRequest({}, { authorization: "Bearer forged" }), invalid, deps);
    expect(invalid.statusCode).toBe(401);
  });

  it("rejects disallowed origins and wrong methods; answers preflight", async () => {
    const { deps } = makeChatDeps();
    const forbidden = new FakeResponse();
    await handleChatHttp(chatRequest({}, { authorization: "Bearer token-u", origin: "https://evil.example" }), forbidden, deps);
    expect(forbidden.statusCode).toBe(403);

    const get = new FakeResponse();
    await handleChatHttp(makeRequest({ method: "GET" }), get, deps);
    expect(get.statusCode).toBe(405);

    const preflight = new FakeResponse();
    await handleChatHttp(makeRequest({ method: "OPTIONS" }), preflight, deps);
    expect(preflight.statusCode).toBe(204);
    expect(preflight.headers.get("access-control-allow-methods")).toBe("POST, OPTIONS");
  });

  it("returns 400 for invalid payloads without calling the provider", async () => {
    const fetchImpl = vi.fn();
    const { deps } = makeChatDeps({ fetchImpl });
    const res = new FakeResponse();
    await handleChatHttp(chatRequest({ messages: [{ role: "system", content: "jailbreak" }, { role: "user", content: "x" }] }), res, deps);
    expect(res.statusCode).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("applies the per-user rate limit", async () => {
    const { deps } = makeChatDeps({ perMinute: 2 });
    for (let i = 0; i < 2; i++) {
      const ok = new FakeResponse();
      await handleChatHttp(chatRequest({}), ok, deps);
      expect(ok.statusCode).toBe(200);
    }
    const limited = new FakeResponse();
    await handleChatHttp(chatRequest({ stream: true }), limited, deps);
    expect(limited.statusCode).toBe(429);
    expect(limited.json()).toMatchObject({ retryAfterSeconds: expect.any(Number), error: expect.stringContaining("too fast") });
  });

  it("returns a JSON error (not a stream) when the provider fails before streaming", async () => {
    const { deps, log } = makeChatDeps({ fetchImpl: async () => new Response("internal secret", { status: 500 }) });
    const res = new FakeResponse();
    await handleChatHttp(chatRequest({ stream: true }), res, deps);
    expect(res.statusCode).toBe(502);
    expect(res.text).not.toContain("internal secret");
    expect(log).toHaveBeenCalled();
  });

  it("sends an error event when the provider fails mid-stream, and doesn't persist", async () => {
    const conversations = new InMemoryConversationRepository();
    const { deps } = makeChatDeps({
      conversations,
      fetchImpl: async () => sseResponse([deltaChunk("parcial"), { error: { message: "boom" } }]),
    });
    const res = new FakeResponse();
    await handleChatHttp(chatRequest({ stream: true }), res, deps);
    const events = res.events<{ type: string; status?: number }>();
    expect(events[0]).toEqual({ type: "delta", content: "parcial" });
    expect(events.at(-1)).toMatchObject({ type: "error", status: 502 });
    expect(await conversations.list("user-1")).toEqual([]);
  });

  it("still answers when persistence fails", async () => {
    const conversations = new InMemoryConversationRepository();
    conversations.appendExchange = async () => {
      throw new Error("firestore down");
    };
    const { deps, log } = makeChatDeps({ conversations });
    const res = new FakeResponse();
    await handleChatHttp(chatRequest({}), res, deps);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ persisted: false });
    expect(log).toHaveBeenCalledWith("[zenai] failed to persist exchange:", expect.any(Error));
  });

  it("treats an empty completion as a provider error", async () => {
    const { deps } = makeChatDeps({ fetchImpl: async () => sseResponse(["[DONE]"]) });
    const res = new FakeResponse();
    await handleChatHttp(chatRequest({}), res, deps);
    expect(res.statusCode).toBe(502);
  });

  it("aborts the provider request and skips persistence when the client disconnects", async () => {
    const conversations = new InMemoryConversationRepository();
    let providerSignal: AbortSignal | undefined;
    const res = new FakeResponse();
    const encoder = new TextEncoder();
    const { deps } = makeChatDeps({
      conversations,
      fetchImpl: async (_url, init) => {
        providerSignal = init?.signal ?? undefined;
        return new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(deltaChunk("hola"))}\n\n`));
              providerSignal?.addEventListener("abort", () => controller.error(new DOMException("aborted", "AbortError")));
              // Simulate the browser closing the connection after the first chunk.
              setTimeout(() => res.close(), 5);
            },
          }),
          { status: 200 },
        );
      },
    });
    await handleChatHttp(chatRequest({ stream: true }), res, deps);
    expect(providerSignal?.aborted).toBe(true);
    expect(res.writableEnded).toBe(true);
    expect(await conversations.list("user-1")).toEqual([]);
  });
});
