import { withSystemPrompt } from "../../../../_shared/chatSystemPrompt.js";
import { ProviderConfigurationError, ProviderRequestError, RateLimitError } from "../../domain/chat.errors.js";
import type { ChatProvider, ChatRequest, ChatUsage } from "../../domain/chat.types.js";

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

type Env = Record<string, string | undefined>;

const PROVIDER_BASE_URLS: Record<ChatProvider, string> = {
  groq: "https://api.groq.com/openai/v1",
  cerebras: "https://api.cerebras.ai/v1",
};

const PROVIDER_KEY_ENV: Record<ChatProvider, string> = {
  groq: "GROQ_API_KEY",
  cerebras: "CEREBRAS_API_KEY",
};

export type CompletionStream = {
  provider: ChatProvider;
  model: string;
  /** Yields text deltas as they arrive from the provider. */
  deltas: AsyncIterable<string>;
  /** Token usage, available once `deltas` is fully consumed (if the provider reports it). */
  getUsage(): ChatUsage | undefined;
};

export type OpenStreamOptions = {
  fetchImpl?: FetchLike;
  env?: Env;
  signal?: AbortSignal;
};

type ProviderChunk = {
  choices?: Array<{ delta?: { content?: string | null } }>;
  usage?: RawUsage | null;
  x_groq?: { usage?: RawUsage | null };
  error?: { message?: string };
};

type RawUsage = { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };

function toUsage(raw: RawUsage | null | undefined): ChatUsage | undefined {
  if (!raw) return undefined;
  return {
    promptTokens: raw.prompt_tokens,
    completionTokens: raw.completion_tokens,
    totalTokens: raw.total_tokens,
  };
}

function parseRetryAfter(header: string | null): number {
  const seconds = header ? Number.parseInt(header, 10) : Number.NaN;
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 60;
}

/** Parses an OpenAI-compatible SSE stream (`data: {...}` lines, terminated by `data: [DONE]`). */
export async function* parseSseStream(body: ReadableStream<Uint8Array>): AsyncGenerator<ProviderChunk> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });

      let newlineIndex = buffer.indexOf("\n");
      while (newlineIndex !== -1) {
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);
        newlineIndex = buffer.indexOf("\n");

        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") return;
        if (!data) continue;

        try {
          yield JSON.parse(data) as ProviderChunk;
        } catch {
          throw new ProviderRequestError(`Invalid SSE chunk: ${data.slice(0, 200)}`);
        }
      }

      if (done) return;
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Opens a streaming chat completion. Resolves once the provider accepted the request,
 * so HTTP errors (auth, rate limit, etc.) are thrown before any content is streamed.
 */
export async function openChatCompletionStream(
  request: ChatRequest,
  { fetchImpl = fetch, env = process.env, signal }: OpenStreamOptions = {},
): Promise<CompletionStream> {
  const { provider, model } = request;
  const apiKey = env[PROVIDER_KEY_ENV[provider]]?.trim();
  if (!apiKey) {
    throw new ProviderConfigurationError(`Missing ${PROVIDER_KEY_ENV[provider]}.`);
  }

  const response = await fetchImpl(`${PROVIDER_BASE_URLS[provider]}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: withSystemPrompt(request.messages),
      stream: true,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
    }),
    signal,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");

    if (response.status === 429) {
      throw new RateLimitError(
        parseRetryAfter(response.headers.get("retry-after")),
        "The AI provider is busy right now. Please try again shortly.",
      );
    }
    if (response.status === 401 || response.status === 403) {
      throw new ProviderConfigurationError(`${provider} rejected the API key (${response.status}): ${detail.slice(0, 300)}`);
    }
    throw new ProviderRequestError(`${provider} responded ${response.status}: ${detail.slice(0, 300)}`);
  }

  if (!response.body) {
    throw new ProviderRequestError(`${provider} returned an empty body.`);
  }

  const body = response.body;
  let usage: ChatUsage | undefined;

  async function* deltas(): AsyncGenerator<string> {
    for await (const chunk of parseSseStream(body)) {
      if (chunk.error) {
        throw new ProviderRequestError(`${provider} stream error: ${chunk.error.message ?? "unknown"}`);
      }
      usage = toUsage(chunk.usage ?? chunk.x_groq?.usage) ?? usage;
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) yield content;
    }
  }

  return {
    provider,
    model,
    deltas: deltas(),
    getUsage: () => usage,
  };
}
