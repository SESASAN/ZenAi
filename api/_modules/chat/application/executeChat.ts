import type { ChatCompletion, ChatRequest } from "../domain/chat.types.js";
import { requestChatCompletion } from "../infrastructure/llm/requestChatCompletion.js";
import { persistExchange } from "../infrastructure/persistence/persistExchange.js";

export async function executeChat(params: {
  uid: string;
  request: Required<Pick<ChatRequest, "messages" | "conversationId">> & ChatRequest;
}): Promise<ChatCompletion> {
  const { uid, request } = params;

  const completion = await requestChatCompletion(request);

  await persistExchange({
    uid,
    conversationId: request.conversationId,
    request,
    response: completion,
  });

  return completion;
}

