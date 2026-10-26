import { FieldValue, Timestamp, type Firestore } from "firebase-admin/firestore";
import { buildConversationTitle, buildPreview } from "../domain/conversationTitle.js";
import { sortMessages, toStoredMessages, type RawMessageDocument } from "../domain/messageDocuments.js";
import type {
  AppendExchangeInput,
  ConversationDetail,
  ConversationRepository,
  ConversationSummary,
} from "../domain/conversation.types.js";

const MAX_LISTED_CONVERSATIONS = 100;

type ConversationDocument = {
  title?: string;
  preview?: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

function millis(value: Timestamp | null | undefined) {
  return value?.toMillis?.() ?? 0;
}

/**
 * Layout: users/{uid}/conversations/{conversationId}/messages/{messageId}
 */
export class FirestoreConversationRepository implements ConversationRepository {
  private readonly db: Firestore;
  private readonly now: () => number;

  constructor(db: Firestore, now: () => number = Date.now) {
    this.db = db;
    this.now = now;
  }

  private conversations(uid: string) {
    return this.db.collection("users").doc(uid).collection("conversations");
  }

  async appendExchange(input: AppendExchangeInput): Promise<void> {
    const conversationRef = this.conversations(input.uid).doc(input.conversationId);
    const messagesRef = conversationRef.collection("messages");
    const now = this.now();
    const preview = buildPreview(input.assistantMessage);

    await this.db.runTransaction(async (tx) => {
      const snap = await tx.get(conversationRef);
      const existing = snap.data() as ConversationDocument | undefined;

      tx.set(
        conversationRef,
        {
          ...(snap.exists ? {} : { createdAt: Timestamp.fromMillis(now) }),
          ...(existing?.title ? {} : { title: input.title }),
          preview,
          updatedAt: Timestamp.fromMillis(now + 1),
          lastProvider: input.provider,
          lastModel: input.model,
          messageCount: FieldValue.increment(2),
        },
        { merge: true },
      );

      tx.create(messagesRef.doc(), {
        role: "user",
        content: input.userMessage,
        createdAtMs: now,
        createdAt: Timestamp.fromMillis(now),
      });

      tx.create(messagesRef.doc(), {
        role: "assistant",
        content: input.assistantMessage,
        createdAtMs: now + 1,
        createdAt: Timestamp.fromMillis(now + 1),
        provider: input.provider,
        model: input.model,
        ...(input.usage ? { usage: stripUndefined(input.usage) } : {}),
      });
    });
  }

  async list(uid: string): Promise<ConversationSummary[]> {
    const snapshot = await this.conversations(uid)
      .orderBy("updatedAt", "desc")
      .limit(MAX_LISTED_CONVERSATIONS)
      .get();

    return Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data() as ConversationDocument;
        let title = data.title;
        let preview = data.preview;

        // Legacy conversations (created before titles were stored): derive and backfill.
        if (!title || preview === undefined) {
          const messages = await this.loadMessages(uid, doc.id);
          title = title || buildConversationTitle(messages.find((m) => m.role === "user")?.content);
          preview = preview ?? buildPreview(messages.at(-1)?.content);
          await doc.ref.set({ title, preview }, { merge: true }).catch(() => undefined);
        }

        return {
          id: doc.id,
          title,
          preview,
          createdAt: millis(data.createdAt),
          updatedAt: millis(data.updatedAt),
        };
      }),
    );
  }

  async get(uid: string, conversationId: string): Promise<ConversationDetail | null> {
    const snap = await this.conversations(uid).doc(conversationId).get();
    if (!snap.exists) return null;

    const data = snap.data() as ConversationDocument;
    const messages = await this.loadMessages(uid, conversationId);

    return {
      id: snap.id,
      title: data.title || buildConversationTitle(messages.find((m) => m.role === "user")?.content),
      preview: data.preview ?? buildPreview(messages.at(-1)?.content),
      createdAt: millis(data.createdAt),
      updatedAt: millis(data.updatedAt),
      messages,
    };
  }

  async delete(uid: string, conversationId: string): Promise<boolean> {
    const ref = this.conversations(uid).doc(conversationId);
    const snap = await ref.get();
    if (!snap.exists) return false;
    await this.db.recursiveDelete(ref);
    return true;
  }

  private async loadMessages(uid: string, conversationId: string) {
    const snapshot = await this.conversations(uid).doc(conversationId).collection("messages").get();
    return sortMessages(
      snapshot.docs.flatMap((doc) => toStoredMessages(doc.id, doc.data() as RawMessageDocument)),
    );
  }
}

function stripUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;
}
