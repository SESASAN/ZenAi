export const CHAT_ROLES = ["system", "user", "assistant"] as const;
export const LLM_PROVIDERS = ["groq", "cerebras"] as const;

export type ChatRole = (typeof CHAT_ROLES)[number];
export type LlmProviderName = (typeof LLM_PROVIDERS)[number];

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatRequest = {
  messages: ChatMessage[];
  provider?: LlmProviderName;
  model?: string;
  conversationId?: string;
  temperature?: number;
  maxTokens?: number;
};

export type ChatCompletion = {
  message: ChatMessage;
  provider: LlmProviderName;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
};

export interface ChatProvider {
  generateReply(input: ChatRequest): Promise<ChatCompletion>;
}
