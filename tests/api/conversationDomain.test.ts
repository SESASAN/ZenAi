import { describe, expect, it } from "vitest";
import { sortMessages, toStoredMessages } from "../../api/_modules/conversations/domain/messageDocuments";
import { buildConversationTitle, buildPreview } from "../../api/_modules/conversations/domain/conversationTitle";
import { parseServiceAccount } from "../../api/_shared/firebaseAdmin";

const ts = (ms: number) => ({ toMillis: () => ms });

describe("toStoredMessages", () => {
  it("maps current one-document-per-message docs", () => {
    expect(toStoredMessages("d1", { role: "user", content: "hola", createdAtMs: 5 })).toEqual([
      { id: "d1", role: "user", content: "hola", createdAt: 5 },
    ]);
    expect(toStoredMessages("d2", { role: "assistant", content: "hi", createdAt: ts(9) })[0]?.createdAt).toBe(9);
  });

  it("expands legacy exchange docs into the last user message + response", () => {
    const legacy = {
      request: [
        { role: "user" as const, content: "first" },
        { role: "assistant" as const, content: "old answer" },
        { role: "user" as const, content: "second" },
      ],
      response: { role: "assistant" as const, content: "new answer" },
      createdAt: ts(100),
    };
    expect(toStoredMessages("L", legacy)).toEqual([
      { id: "L-u", role: "user", content: "second", createdAt: 100 },
      { id: "L-a", role: "assistant", content: "new answer", createdAt: 101 },
    ]);
  });

  it("ignores unknown documents and sorts chronologically", () => {
    expect(toStoredMessages("x", { role: "system", content: "s" })).toEqual([]);
    const sorted = sortMessages([
      { id: "b", role: "assistant", content: "", createdAt: 2 },
      { id: "a", role: "user", content: "", createdAt: 1 },
    ]);
    expect(sorted.map((m) => m.id)).toEqual(["a", "b"]);
  });
});

describe("titles and previews", () => {
  it("builds compact titles", () => {
    expect(buildConversationTitle("  Hola   mundo ")).toBe("Hola mundo");
    expect(buildConversationTitle("x".repeat(40))).toBe(`${"x".repeat(32)}...`);
    expect(buildConversationTitle("   ")).toBe("New chat");
    expect(buildConversationTitle(undefined)).toBe("New chat");
    expect(buildPreview("a".repeat(100)).length).toBe(83);
  });
});

describe("parseServiceAccount", () => {
  const account = { project_id: "p", client_email: "e@p.iam", private_key: "-----BEGIN-----\\nabc\\n-----END-----" };

  it("accepts raw JSON and base64, normalizing escaped newlines", () => {
    const raw = parseServiceAccount(JSON.stringify(account));
    expect(raw?.private_key).toBe("-----BEGIN-----\nabc\n-----END-----");
    const b64 = parseServiceAccount(Buffer.from(JSON.stringify(account)).toString("base64"));
    expect(b64).toEqual(raw);
  });

  it("returns null when unset", () => {
    expect(parseServiceAccount(undefined)).toBeNull();
    expect(parseServiceAccount("  ")).toBeNull();
  });
});
