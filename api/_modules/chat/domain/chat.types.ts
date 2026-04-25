export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatProvider = "groq" | "cerebras";

export type ChatRequest = {
  provider?: ChatProvider;
  model?: string;
  conversationId?: string;
  temperature?: number;
  maxTokens?: number;
  messages?: ChatMessage[];
};

export type ChatCompletion = {
  message: {
    role: "assistant";
    content: string;
  };
  provider: ChatProvider;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
};

