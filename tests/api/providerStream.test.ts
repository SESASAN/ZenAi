import { describe, expect, it, vi } from "vitest";
import { openChatCompletionStream } from "../../api/_modules/chat/infrastructure/llm/requestChatCompletion";
import { ZENAI_SYSTEM_PROMPT } from "../../api/_shared/chatSystemPrompt";
import {
  ProviderConfigurationError,
  ProviderRequestError,
  RateLimitError,
} from "../../api/_modules/chat/domain/chat.errors";
import type { ChatRequest } from "../../api/_modules/chat/domain/chat.types";
import { deltaChunk, sseResponse } from "../helpers/http";

const request: ChatRequest = {
  conversationId: "c1",
  messages: [{ role: "user", content: "Hola" }],
  provider: "groq",
  model: "llama-3.3-70b-versatile",
  temperature: 0.2,
  maxTokens: 512,
  stream: true,
};

const env = { GROQ_API_KEY: "test-key", CEREBRAS_API_KEY: "cb-key" };

async function collect(iterable: AsyncIterable<string>) {
  let text = "";
  for await (const delta of iterable) text += delta;
  return text;
}

describe("openChatCompletionStream", () => {
  it("sends a streaming request with the system prompt and allowed parameters", async () => {
    const fetchImpl = vi.fn(async () => sseResponse([deltaChunk("Hi"), "[DONE]"]));
    await openChatCompletionStream(request, { fetchImpl, env });

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-key");
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({ model: request.model, stream: true, temperature: 0.2, max_tokens: 512 });
    expect(body.messages[0]).toEqual({ role: "system", content: ZENAI_SYSTEM_PROMPT });
    expect(body.messages[1]).toEqual({ role: "user", content: "Hola" });
  });

  it("uses the Cerebras endpoint and key", async () => {
    const fetchImpl = vi.fn(async () => sseResponse(["[DONE]"]));
    await openChatCompletionStream({ ...request, provider: "cerebras", model: "gpt-oss-120b" }, { fetchImpl, env });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.cerebras.ai/v1/chat/completions");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer cb-key");
  });

  it("yields deltas even when SSE events are split across network chunks, and reads usage", async () => {
    const fetchImpl = async () =>
      sseResponse(
        [
          deltaChunk("Hola, "),
          { choices: [{ delta: {} }] },
          deltaChunk("¿cómo estás? ✨"),
          { choices: [], x_groq: { usage: { prompt_tokens: 3, completion_tokens: 5, total_tokens: 8 } } },
          "[DONE]",
          deltaChunk("ignored after DONE"),
        ],
        { splitEvery: 7 },
      );

    const stream = await openChatCompletionStream(request, { fetchImpl, env });
    expect(await collect(stream.deltas)).toBe("Hola, ¿cómo estás? ✨");
    expect(stream.getUsage()).toEqual({ promptTokens: 3, completionTokens: 5, totalTokens: 8 });
  });

  it("fails fast when the API key is missing", async () => {
    const fetchImpl = vi.fn();
    await expect(openChatCompletionStream(request, { fetchImpl, env: {} })).rejects.toBeInstanceOf(ProviderConfigurationError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("maps provider HTTP errors", async () => {
    const respond = (status: number, headers: Record<string, string> = {}) => async () =>
      new Response("{\"error\":{\"message\":\"nope\"}}", { status, headers });

    await expect(openChatCompletionStream(request, { fetchImpl: respond(429, { "retry-after": "17" }), env }))
      .rejects.toMatchObject({ constructor: RateLimitError, retryAfterSeconds: 17 });
    await expect(openChatCompletionStream(request, { fetchImpl: respond(429), env }))
      .rejects.toMatchObject({ retryAfterSeconds: 60 });
    await expect(openChatCompletionStream(request, { fetchImpl: respond(401), env }))
      .rejects.toBeInstanceOf(ProviderConfigurationError);
    await expect(openChatCompletionStream(request, { fetchImpl: respond(503), env }))
      .rejects.toBeInstanceOf(ProviderRequestError);
  });

  it("surfaces errors sent inside the stream", async () => {
    const fetchImpl = async () => sseResponse([deltaChunk("a"), { error: { message: "overloaded" } }]);
    const stream = await openChatCompletionStream(request, { fetchImpl, env });
    await expect(collect(stream.deltas)).rejects.toBeInstanceOf(ProviderRequestError);
  });
});
