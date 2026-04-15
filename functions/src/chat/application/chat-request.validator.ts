import { CHAT_ROLES, LLM_PROVIDERS, type ChatMessage, type ChatRequest } from "../domain/chat.types.js";
import { ChatValidationError } from "../domain/chat.errors.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!isRecord(value)) return false;

  return (
    typeof value.role === "string" &&
    CHAT_ROLES.includes(value.role as ChatMessage["role"]) &&
    typeof value.content === "string"
  );
}

export function parseChatRequest(body: unknown): ChatRequest {
  if (!isRecord(body)) {
    throw new ChatValidationError("El body debe ser un objeto JSON.");
  }

  const { messages, provider, model, conversationId, temperature, maxTokens } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new ChatValidationError("`messages` debe ser un arreglo con al menos un mensaje.");
  }

  if (!messages.every(isChatMessage)) {
    throw new ChatValidationError("Cada mensaje debe tener `role` válido y `content` string.");
  }

  const normalizedMessages = messages.map((message) => ({
    role: message.role,
    content: message.content.trim(),
  }));

  if (normalizedMessages.some((message) => message.content.length === 0)) {
    throw new ChatValidationError("Los mensajes no pueden estar vacíos.");
  }

  if (provider !== undefined && (typeof provider !== "string" || !LLM_PROVIDERS.includes(provider as (typeof LLM_PROVIDERS)[number]))) {
    throw new ChatValidationError("`provider` debe ser `groq` o `cerebras`.");
  }

  const normalizedProvider = provider as ChatRequest["provider"];

  if (model !== undefined && typeof model !== "string") {
    throw new ChatValidationError("`model` debe ser string.");
  }

  if (conversationId !== undefined && typeof conversationId !== "string") {
    throw new ChatValidationError("`conversationId` debe ser string.");
  }

  if (temperature !== undefined && (typeof temperature !== "number" || Number.isNaN(temperature))) {
    throw new ChatValidationError("`temperature` debe ser un número válido.");
  }

  if (maxTokens !== undefined && (typeof maxTokens !== "number" || !Number.isInteger(maxTokens) || maxTokens <= 0)) {
    throw new ChatValidationError("`maxTokens` debe ser un entero positivo.");
  }

  return {
    messages: normalizedMessages,
    provider: normalizedProvider,
    model,
    conversationId,
    temperature,
    maxTokens,
  };
}
