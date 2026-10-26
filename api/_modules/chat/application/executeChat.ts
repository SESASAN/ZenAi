import { buildConversationTitle } from "../../conversations/domain/conversationTitle.js";
import type { ConversationRepository } from "../../conversations/domain/conversation.types.js";
import type { RateLimiter } from "../../rateLimit/domain/rateLimit.js";
import { ProviderRequestError } from "../domain/chat.errors.js";
import type { ChatCompletion, ChatRequest } from "../domain/chat.types.js";
import type { CompletionStream } from "../infrastructure/llm/requestChatCompletion.js";

export type OpenCompletionStream = (request: ChatRequest, signal?: AbortSignal) => Promise<CompletionStream>;

export type ChatDependencies = {
  rateLimiter: RateLimiter;
  conversations: ConversationRepository;
  openStream: OpenCompletionStream;
  log?: (...args: unknown[]) => void;
};

export type ChatResult = ChatCompletion & { persisted: boolean };

/**
 * Runs a chat turn:
 * 1. consumes the user's rate limit,
 * 2. streams the provider response (calling `onDelta` for each chunk),
 * 3. stores only the new exchange.
 * Errors before the first delta (rate limit, provider errors) are thrown before any `onDelta` call.
 */
export async function executeChat(params: {
  uid: string;
  request: ChatRequest;
  deps: ChatDependencies;
  onDelta?: (delta: string) => void;
  signal?: AbortSignal;
}): Promise<ChatResult> {
  const { uid, request, deps, onDelta, signal } = params;
  const log = deps.log ?? console.error;

  await deps.rateLimiter.consume(uid);

  const stream = await deps.openStream(request, signal);

  let content = "";
  for await (const delta of stream.deltas) {
    content += delta;
    onDelta?.(delta);
  }

  signal?.throwIfAborted();

  content = content.trim();
  if (!content) {
    throw new ProviderRequestError(`${stream.provider} returned an empty completion.`);
  }

  const completion: ChatCompletion = {
    message: { role: "assistant", content },
    provider: stream.provider,
    model: stream.model,
    usage: stream.getUsage(),
  };

  let persisted = true;
  try {
    await deps.conversations.appendExchange({
      uid,
      conversationId: request.conversationId,
      title: buildConversationTitle(request.messages.find((m) => m.role === "user")?.content),
      userMessage: request.messages.at(-1)!.content,
      assistantMessage: content,
      provider: completion.provider,
      model: completion.model,
      usage: completion.usage,
    });
  } catch (error) {
    // The user already received the answer; don't fail the request, but log it.
    persisted = false;
    log("[zenai] failed to persist exchange:", error);
  }

  return { ...completion, persisted };
}
