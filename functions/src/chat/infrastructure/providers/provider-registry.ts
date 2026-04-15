import type { ChatProvider, LlmProviderName } from "../../domain/chat.types.js";
import { OpenAiCompatibleProvider } from "./openai-compatible.provider.js";

type ProviderRegistryOptions = {
  groqApiKey?: string;
  cerebrasApiKey?: string;
};

export const DEFAULT_PROVIDER: LlmProviderName = "groq";

const DEFAULT_MODELS: Record<LlmProviderName, string> = {
  groq: "llama-3.3-70b-versatile",
  cerebras: "gpt-oss-120b",
};

export function createProviderRegistry(options: ProviderRegistryOptions): Map<string, ChatProvider> {
  return new Map<string, ChatProvider>([
    [
      "groq",
      new OpenAiCompatibleProvider({
        provider: "groq",
        baseUrl: "https://api.groq.com/openai/v1",
        apiKey: options.groqApiKey,
        defaultModel: DEFAULT_MODELS.groq,
      }),
    ],
    [
      "cerebras",
      new OpenAiCompatibleProvider({
        provider: "cerebras",
        baseUrl: "https://api.cerebras.ai/v1",
        apiKey: options.cerebrasApiKey,
        defaultModel: DEFAULT_MODELS.cerebras,
      }),
    ],
  ]);
}
