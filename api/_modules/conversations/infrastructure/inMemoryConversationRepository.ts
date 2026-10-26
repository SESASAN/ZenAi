import { buildPreview } from "../domain/conversationTitle.js";
import type {
  AppendExchangeInput,
  ConversationDetail,
  ConversationRepository,
  ConversationSummary,
} from "../domain/conversation.types.js";

/** Process-local repository (tests and local development). */
export class InMemoryConversationRepository implements ConversationRepository {
  private readonly data = new Map<string, Map<string, ConversationDetail>>();
  private readonly now: () => number;
  private sequence = 0;

  constructor(now: () => number = Date.now) {
    this.now = now;
  }

  private userConversations(uid: string) {
    let conversations = this.data.get(uid);
    if (!conversations) {
      conversations = new Map();
      this.data.set(uid, conversations);
    }
    return conversations;
  }

  async appendExchange(input: AppendExchangeInput): Promise<void> {
    const conversations = this.userConversations(input.uid);
    const now = this.now();
    const existing = conversations.get(input.conversationId);
    const conversation: ConversationDetail = existing ?? {
      id: input.conversationId,
      title: input.title,
      preview: "",
      createdAt: now,
      updatedAt: now,
      messages: [],
    };

    conversation.messages.push(
      { id: `m${++this.sequence}`, role: "user", content: input.userMessage, createdAt: now },
      { id: `m${++this.sequence}`, role: "assistant", content: input.assistantMessage, createdAt: now + 1 },
    );
    conversation.preview = buildPreview(input.assistantMessage);
    conversation.updatedAt = now + 1;
    conversations.set(input.conversationId, conversation);
  }

  async list(uid: string): Promise<ConversationSummary[]> {
    return [...this.userConversations(uid).values()]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map(({ id, title, preview, createdAt, updatedAt }) => ({ id, title, preview, createdAt, updatedAt }));
  }

  async get(uid: string, conversationId: string): Promise<ConversationDetail | null> {
    const conversation = this.userConversations(uid).get(conversationId);
    return conversation ? structuredClone(conversation) : null;
  }

  async delete(uid: string, conversationId: string): Promise<boolean> {
    return this.userConversations(uid).delete(conversationId);
  }
}
