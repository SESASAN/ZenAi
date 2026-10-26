export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

/** Messages sent to the LLM (the system prompt is only added server-side). */
export type LlmMessage = {
  role: "system" | ChatRole;
  content: string;
};

export type ChatProvider = "groq" | "cerebras";

export type ChatRequest = {
  conversationId: string;
  messages: ChatMessage[];
  provider: ChatProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  stream: boolean;
};

export type ChatUsage = {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

export type ChatCompletion = {
  message: {
    role: "assistant";
    content: string;
  };
  provider: ChatProvider;
  model: string;
  usage?: ChatUsage;
};
