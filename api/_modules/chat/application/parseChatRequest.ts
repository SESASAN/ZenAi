import type { ChatMessage, ChatRequest } from "../domain/chat.types.js";
import { ChatValidationError } from "../domain/chat.errors.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseChatRequest(
  body: unknown,
): Required<Pick<ChatRequest, "messages" | "conversationId">> & ChatRequest {
  if (!isRecord(body)) {
    throw new ChatValidationError("El body debe ser un objeto JSON.");
  }

  const conversationId = body.conversationId;
  const messages = body.messages;

  if (typeof conversationId !== "string" || conversationId.trim().length === 0) {
    throw new ChatValidationError("Falta `conversationId`.");
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new ChatValidationError("`messages` debe ser un arreglo con al menos un mensaje.");
  }

  const normalizedMessages: ChatMessage[] = messages.map((m) => {
    const candidate = isRecord(m) ? m : {};
    return {
      role: candidate.role as ChatMessage["role"],
      content: typeof candidate.content === "string" ? candidate.content.trim() : "",
    };
  });

  const validRoles = new Set(["system", "user", "assistant"]);
  if (normalizedMessages.some((m) => !validRoles.has(m.role) || m.content.length === 0)) {
    throw new ChatValidationError("Cada mensaje debe tener `role` válido y `content` no vacío.");
  }

  const provider = body.provider;
  const model = body.model;
  const temperature = body.temperature;
  const maxTokens = body.maxTokens;

  return {
    conversationId: conversationId.trim(),
    messages: normalizedMessages,
    provider: provider === "cerebras" ? "cerebras" : provider === "groq" ? "groq" : undefined,
    model: typeof model === "string" ? model : undefined,
    temperature: typeof temperature === "number" ? temperature : undefined,
    maxTokens: typeof maxTokens === "number" ? maxTokens : undefined,
  };
}

