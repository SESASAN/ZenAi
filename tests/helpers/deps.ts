import { vi } from "vitest";
import { InvalidTokenError } from "../../api/_modules/auth/domain/auth.errors";
import type { ChatHttpDependencies } from "../../api/_modules/chat/presentation/http/chat.http";
import { openChatCompletionStream, type FetchLike } from "../../api/_modules/chat/infrastructure/llm/requestChatCompletion";
import { InMemoryConversationRepository } from "../../api/_modules/conversations/infrastructure/inMemoryConversationRepository";
import { InMemoryRateLimiter } from "../../api/_modules/rateLimit/infrastructure/inMemoryRateLimiter";
import { deltaChunk, sseResponse } from "./http";

/** Tokens look like `token-<uid>`. */
export async function fakeVerifyToken(token: string) {
  if (!token.startsWith("token-")) throw new InvalidTokenError();
  return { uid: token.slice("token-".length) };
}

export function makeChatDeps(options: {
  fetchImpl?: FetchLike;
  perMinute?: number;
  conversations?: InMemoryConversationRepository;
} = {}) {
  let clock = 1_700_000_000_000;
  const now = () => (clock += 10);
  const fetchImpl: FetchLike =
    options.fetchImpl ?? (async () => sseResponse([deltaChunk("Hola"), deltaChunk(", soy ZenAI."), "[DONE]"]));
  const log = vi.fn();

  const deps: ChatHttpDependencies = {
    verifyToken: fakeVerifyToken,
    conversations: options.conversations ?? new InMemoryConversationRepository(now),
    rateLimiter: new InMemoryRateLimiter({ perMinute: options.perMinute ?? 100, perDay: 1000 }, now),
    openStream: (request, signal) =>
      openChatCompletionStream(request, { fetchImpl, signal, env: { GROQ_API_KEY: "test", CEREBRAS_API_KEY: "test" } }),
    env: {},
    log,
  };
  return { deps, log };
}
