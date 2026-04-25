import { withSystemPrompt } from "../../../../_shared/chatSystemPrompt.js";
import type { ChatCompletion, ChatProvider, ChatRequest } from "../../domain/chat.types.js";
import { ProviderConfigurationError, ProviderRequestError, RateLimitError } from "../../domain/chat.errors.js";

type ProviderConfig = {
  baseUrl: string;
  apiKey?: string;
  defaultModel: string;
};

function resolveProviderConfig(provider: ChatProvider): ProviderConfig {
  if (provider === "groq") {
    return {
      baseUrl: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY,
      defaultModel: "llama-3.3-70b-versatile",
    };
  }

  return {
    baseUrl: "https://api.cerebras.ai/v1",
    apiKey: process.env.CEREBRAS_API_KEY,
    defaultModel: "gpt-oss-120b",
  };
}

export async function requestChatCompletion(
  request: Required<Pick<ChatRequest, "messages">> & ChatRequest,
): Promise<ChatCompletion> {
  const provider: ChatProvider = request.provider ?? "groq";
  const config = resolveProviderConfig(provider);

  const apiKey = config.apiKey?.trim();
  if (!apiKey) {
    throw new ProviderConfigurationError(`Falta configurar la API key para ${provider}.`);
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: request.model ?? config.defaultModel,
      messages: withSystemPrompt(request.messages),
      stream: false,
      temperature: request.temperature ?? 0.2,
      ...(request.maxTokens ? { max_tokens: request.maxTokens } : {}),
    }),
  });

  type ProviderPayload = {
    choices?: Array<{ message?: { content?: string | null } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    model?: string;
    error?: { message?: string };
  };

  let payload: ProviderPayload = {};
  try {
    payload = (await response.json()) as ProviderPayload;
  } catch {
    payload = {};
  }

  if (!response.ok) {
    if (response.status === 429) {
      const retryAfterHeader = response.headers.get("retry-after");
      const seconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 3600;
      throw new RateLimitError(Number.isNaN(seconds) ? 3600 : seconds);
    }

    const message = payload?.error?.message;
    throw new ProviderRequestError(message || `El provider ${provider} respondió con estado ${response.status}.`);
  }

  const content = payload?.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new ProviderRequestError(`El provider ${provider} no devolvió contenido usable.`);
  }

  return {
    message: { role: "assistant", content },
    provider,
    model: payload?.model ?? request.model ?? config.defaultModel,
    usage: {
      promptTokens: payload?.usage?.prompt_tokens,
      completionTokens: payload?.usage?.completion_tokens,
      totalTokens: payload?.usage?.total_tokens,
    },
  };
}
