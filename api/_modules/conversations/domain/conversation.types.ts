import type { ChatProvider, ChatUsage } from "../../chat/domain/chat.types.js";

export type StoredMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

export type ConversationSummary = {
  id: string;
  title: string;
  preview: string;
  createdAt: number;
  updatedAt: number;
};

export type ConversationDetail = ConversationSummary & {
  messages: StoredMessage[];
};

export type AppendExchangeInput = {
  uid: string;
  conversationId: string;
  /** Used only when the conversation is created. */
  title: string;
  userMessage: string;
  assistantMessage: string;
  provider: ChatProvider;
  model: string;
  usage?: ChatUsage;
};

export interface ConversationRepository {
  /** Stores only the new exchange (last user message + assistant reply). */
  appendExchange(input: AppendExchangeInput): Promise<void>;
  list(uid: string): Promise<ConversationSummary[]>;
  get(uid: string, conversationId: string): Promise<ConversationDetail | null>;
  /** Returns false when the conversation doesn't exist. */
  delete(uid: string, conversationId: string): Promise<boolean>;
}
