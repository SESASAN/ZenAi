import { CHAT_LIMITS, CONVERSATION_ID_PATTERN, DEFAULT_PROVIDER, PROVIDER_MODELS } from "../domain/chat.limits.js";
import { ChatValidationError } from "../domain/chat.errors.js";
import type { ChatMessage, ChatProvider, ChatRequest } from "../domain/chat.types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseBody(body: unknown): unknown {
  if (typeof body !== "string") return body;
  try {
    return JSON.parse(body);
  } catch {
    throw new ChatValidationError("The request body must be valid JSON.");
  }
}

export function parseChatRequest(rawBody: unknown): ChatRequest {
  const body = parseBody(rawBody);
  if (!isRecord(body)) {
    throw new ChatValidationError("The request body must be a JSON object.");
  }

  const conversationId = typeof body.conversationId === "string" ? body.conversationId.trim() : "";
  if (!CONVERSATION_ID_PATTERN.test(conversationId)) {
    throw new ChatValidationError("`conversationId` is missing or invalid.");
  }

  const rawMessages = body.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    throw new ChatValidationError("`messages` must be a non-empty array.");
  }
  if (rawMessages.length > CHAT_LIMITS.maxMessages) {
    throw new ChatValidationError(`Too many messages (max ${CHAT_LIMITS.maxMessages}).`);
  }

  let totalChars = 0;
  const messages: ChatMessage[] = rawMessages.map((raw) => {
    const candidate = isRecord(raw) ? raw : {};
    const role = candidate.role;
    const content = typeof candidate.content === "string" ? candidate.content.trim() : "";

    if (role === "system") {
      throw new ChatValidationError("System messages are not allowed.");
    }
    if (role !== "user" && role !== "assistant") {
      throw new ChatValidationError("Each message needs a valid `role` (user or assistant).");
    }
    if (content.length === 0) {
      throw new ChatValidationError("Messages can't be empty.");
    }
    if (content.length > CHAT_LIMITS.maxMessageChars) {
      throw new ChatValidationError(`Each message can have at most ${CHAT_LIMITS.maxMessageChars} characters.`);
    }

    totalChars += content.length;
    return { role, content };
  });

  if (totalChars > CHAT_LIMITS.maxTotalChars) {
    throw new ChatValidationError("The conversation is too long to send in a single request.");
  }
  if (messages.at(-1)?.role !== "user") {
    throw new ChatValidationError("The last message must come from the user.");
  }

  let provider: ChatProvider = DEFAULT_PROVIDER;
  if (body.provider !== undefined) {
    if (body.provider !== "groq" && body.provider !== "cerebras") {
      throw new ChatValidationError("Unsupported provider.");
    }
    provider = body.provider;
  }

  const allowedModels = PROVIDER_MODELS[provider];
  let model = allowedModels[0];
  if (body.model !== undefined) {
    if (typeof body.model !== "string" || !allowedModels.includes(body.model)) {
      throw new ChatValidationError(`Unsupported model for ${provider}.`);
    }
    model = body.model;
  }

  const temperature = typeof body.temperature === "number" && Number.isFinite(body.temperature)
    ? clamp(body.temperature, CHAT_LIMITS.minTemperature, CHAT_LIMITS.maxTemperature)
    : CHAT_LIMITS.defaultTemperature;

  const maxTokens = typeof body.maxTokens === "number" && Number.isFinite(body.maxTokens)
    ? clamp(Math.floor(body.maxTokens), 1, CHAT_LIMITS.maxTokensCap)
    : CHAT_LIMITS.defaultMaxTokens;

  return {
    conversationId,
    messages,
    provider,
    model,
    temperature,
    maxTokens,
    stream: body.stream === true,
  };
}
