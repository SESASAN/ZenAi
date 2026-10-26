import { describe, expect, it } from "vitest";
import { handleConversationsHttp } from "../../api/_modules/conversations/presentation/http/conversations.http";
import { InMemoryConversationRepository } from "../../api/_modules/conversations/infrastructure/inMemoryConversationRepository";
import { FakeResponse, makeRequest } from "../helpers/http";
import { fakeVerifyToken } from "../helpers/deps";

async function setup() {
  let clock = 0;
  const conversations = new InMemoryConversationRepository(() => (clock += 100));
  const base = { uid: "user-1", provider: "groq" as const, model: "m" };
  await conversations.appendExchange({ ...base, conversationId: "a", title: "Chat A", userMessage: "q1", assistantMessage: "r1" });
  await conversations.appendExchange({ ...base, conversationId: "b", title: "Chat B", userMessage: "q2", assistantMessage: "r2" });
  await conversations.appendExchange({ ...base, uid: "user-2", conversationId: "c", title: "Other", userMessage: "x", assistantMessage: "y" });
  const deps = { conversations, verifyToken: fakeVerifyToken, env: {} };
  const call = async (method: string, url: string, token = "token-user-1") => {
    const res = new FakeResponse();
    await handleConversationsHttp(
      makeRequest({ method, url, headers: { authorization: `Bearer ${token}`, origin: "http://localhost:5173" } }),
      res,
      deps,
    );
    return res;
  };
  return { call, conversations };
}

describe("/api/conversations", () => {
  it("lists the user's conversations, most recent first", async () => {
    const { call } = await setup();
    const res = await call("GET", "/api/conversations");
    expect(res.statusCode).toBe(200);
    const { conversations } = res.json<{ conversations: Array<{ id: string; title: string; preview: string }> }>();
    expect(conversations.map((c) => c.id)).toEqual(["b", "a"]);
    expect(conversations[0]).toMatchObject({ title: "Chat B", preview: "r2" });
    expect(conversations[0]).not.toHaveProperty("messages");
  });

  it("returns one conversation with its messages", async () => {
    const { call } = await setup();
    const res = await call("GET", "/api/conversations?id=a");
    expect(res.json()).toMatchObject({
      conversation: { id: "a", messages: [{ role: "user", content: "q1" }, { role: "assistant", content: "r1" }] },
    });
  });

  it("doesn't expose other users' conversations", async () => {
    const { call } = await setup();
    expect((await call("GET", "/api/conversations?id=c")).statusCode).toBe(404);
    expect((await call("DELETE", "/api/conversations?id=c")).statusCode).toBe(404);
  });

  it("deletes a conversation", async () => {
    const { call, conversations } = await setup();
    const res = await call("DELETE", "/api/conversations?id=a");
    expect(res.statusCode).toBe(204);
    expect(await conversations.get("user-1", "a")).toBeNull();
    expect((await call("DELETE", "/api/conversations?id=a")).statusCode).toBe(404);
  });

  it("validates input, auth and methods", async () => {
    const { call } = await setup();
    expect((await call("DELETE", "/api/conversations")).statusCode).toBe(400);
    expect((await call("GET", "/api/conversations?id=../x")).statusCode).toBe(400);
    expect((await call("GET", "/api/conversations", "bad")).statusCode).toBe(401);
    expect((await call("POST", "/api/conversations")).statusCode).toBe(405);
    expect((await call("OPTIONS", "/api/conversations")).statusCode).toBe(204);
  });
});
