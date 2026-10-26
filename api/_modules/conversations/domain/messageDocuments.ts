import type { StoredMessage } from "./conversation.types.js";

type TimestampLike = { toMillis(): number };

type RawRole = "user" | "assistant" | "system";

/**
 * Raw Firestore message document. Two shapes exist:
 * - current: one document per message `{ role, content, createdAtMs, ... }`
 * - legacy:  one document per exchange `{ request: Message[], response: Message, createdAt }`
 */
export type RawMessageDocument = {
  role?: RawRole;
  content?: string;
  createdAtMs?: number;
  createdAt?: TimestampLike | null;
  request?: Array<{ role?: RawRole; content?: string }>;
  response?: { role?: RawRole; content?: string };
};

function toMillis(doc: RawMessageDocument) {
  if (typeof doc.createdAtMs === "number") return doc.createdAtMs;
  return doc.createdAt?.toMillis?.() ?? 0;
}

/** Converts a stored document (current or legacy) into UI messages. */
export function toStoredMessages(docId: string, doc: RawMessageDocument): StoredMessage[] {
  const createdAt = toMillis(doc);

  if (doc.request !== undefined || doc.response !== undefined) {
    const lastUser = [...(doc.request ?? [])].reverse().find((m) => m.role === "user" && m.content);
    const messages: StoredMessage[] = [];
    if (lastUser?.content) {
      messages.push({ id: `${docId}-u`, role: "user", content: lastUser.content, createdAt });
    }
    if (doc.response?.content) {
      messages.push({ id: `${docId}-a`, role: "assistant", content: doc.response.content, createdAt: createdAt + 1 });
    }
    return messages;
  }

  if ((doc.role === "user" || doc.role === "assistant") && typeof doc.content === "string") {
    return [{ id: docId, role: doc.role, content: doc.content, createdAt }];
  }

  return [];
}

export function sortMessages(messages: StoredMessage[]) {
  return [...messages].sort((a, b) => a.createdAt - b.createdAt);
}
