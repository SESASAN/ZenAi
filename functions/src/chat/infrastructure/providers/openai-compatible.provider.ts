import type { ChatCompletion, ChatProvider, ChatRequest, LlmProviderName } from "../../domain/chat.types.js";
import { ProviderConfigurationError, ProviderRequestError, RateLimitError } from "../../domain/chat.errors.js";

type OpenAiCompatibleProviderConfig = {
  provider: LlmProviderName;
  baseUrl: string;
  apiKey: string | undefined;
  defaultModel: string;
};

type OpenAiCompatibleResponse = {
  choices?: Array<{
    message?: {
      role?: "assistant" | "user" | "system";
      content?: string | null;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  model?: string;
  error?: {
    message?: string;
  };
};

export class OpenAiCompatibleProvider implements ChatProvider {
  constructor(private readonly config: OpenAiCompatibleProviderConfig) {}

  async generateReply(input: ChatRequest): Promise<ChatCompletion> {
    const apiKey = this.config.apiKey?.trim();

    if (!apiKey) {
      throw new ProviderConfigurationError(`Falta configurar la API key para ${this.config.provider}.`);
    }

    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: input.model ?? this.config.defaultModel,
        messages: input.messages,
        stream: false,
        temperature: input.temperature ?? 0.2,
        ...(input.maxTokens ? { max_tokens: input.maxTokens } : {}),
      }),
    });

    const payload = (await response.json()) as OpenAiCompatibleResponse;

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after");
        const seconds = retryAfter ? parseInt(retryAfter, 10) : 3600;
        if (!Number.isNaN(seconds)) {
          throw new RateLimitError(seconds);
        }
      }
      throw new ProviderRequestError(
        payload.error?.message ?? `El provider ${this.config.provider} respondió con estado ${response.status}.`,
      );
    }

    const content = payload.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new ProviderRequestError(`El provider ${this.config.provider} no devolvió contenido usable.`);
    }

    return {
      message: {
        role: "assistant",
        content,
      },
      provider: this.config.provider,
      model: payload.model ?? input.model ?? this.config.defaultModel,
      usage: {
        promptTokens: payload.usage?.prompt_tokens,
        completionTokens: payload.usage?.completion_tokens,
        totalTokens: payload.usage?.total_tokens,
      },
    };
  }
}
