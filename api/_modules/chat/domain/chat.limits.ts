import type { ChatProvider } from "./chat.types.js";

export const CHAT_LIMITS = {
  /** Max messages of history accepted per request. */
  maxMessages: 40,
  /** Max characters per message. */
  maxMessageChars: 8_000,
  /** Max characters for the whole history. */
  maxTotalChars: 60_000,
  defaultMaxTokens: 1_024,
  maxTokensCap: 2_048,
  defaultTemperature: 0.2,
  minTemperature: 0,
  maxTemperature: 1.5,
} as const;

export const DEFAULT_PROVIDER: ChatProvider = "groq";

/** Only these models can be requested by clients. The first one is the default. */
export const PROVIDER_MODELS: Record<ChatProvider, readonly [string, ...string[]]> = {
  groq: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
  cerebras: ["gpt-oss-120b", "llama3.1-8b"],
};

export const CONVERSATION_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
