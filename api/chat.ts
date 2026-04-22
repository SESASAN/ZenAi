import { FieldValue } from "firebase-admin/firestore";

// En runtime ESM (Vercel) las imports relativas necesitan extensión.
import { adminAuth, adminDb } from "./_shared/firebaseAdmin.js";

type RequestLike = {
  method?: string;
  headers?: Record<string, string | undefined>;
  body?: unknown;
};

type ResponseLike = {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body?: string): void;
};

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatRequest = {
  provider?: "groq" | "cerebras";
  model?: string;
  conversationId?: string;
  temperature?: number;
  maxTokens?: number;
  messages?: ChatMessage[];
};

type ChatCompletion = {
  message: {
    role: "assistant";
    content: string;
  };
  provider: "groq" | "cerebras";
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
};

class RateLimitError extends Error {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super("Se acabaron las peticiones de hoy. Volvé a intentarlo más tarde.");
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function applyCors(res: { setHeader(name: string, value: string): void }) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
}

function extractBearerToken(authorizationHeader: string | undefined) {
  if (!authorizationHeader) return null;
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseChatRequest(body: unknown): Required<Pick<ChatRequest, "messages" | "conversationId">> & ChatRequest {
  if (!isRecord(body)) {
    throw new Error("El body debe ser un objeto JSON.");
  }

  const conversationId = body.conversationId;
  const messages = body.messages;

  if (typeof conversationId !== "string" || conversationId.trim().length === 0) {
    throw new Error("Falta `conversationId`." );
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("`messages` debe ser un arreglo con al menos un mensaje.");
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
    throw new Error("Cada mensaje debe tener `role` válido y `content` no vacío.");
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

async function callProvider(request: Required<Pick<ChatRequest, "messages">> & ChatRequest): Promise<ChatCompletion> {
  const provider = request.provider ?? "groq";

  const config =
    provider === "groq"
      ? {
          baseUrl: "https://api.groq.com/openai/v1",
          apiKey: process.env.GROQ_API_KEY,
          defaultModel: "llama-3.3-70b-versatile",
        }
      : {
          baseUrl: "https://api.cerebras.ai/v1",
          apiKey: process.env.CEREBRAS_API_KEY,
          defaultModel: "gpt-oss-120b",
        };

  const apiKey = config.apiKey?.trim();
  if (!apiKey) {
    throw new Error(`Falta configurar la API key para ${provider}.`);
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: request.model ?? config.defaultModel,
      messages: request.messages,
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
    throw new Error(message || `El provider ${provider} respondió con estado ${response.status}.`);
  }

  const content = payload?.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error(`El provider ${provider} no devolvió contenido usable.`);
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

async function persistExchange(params: {
  uid: string;
  conversationId: string;
  request: Required<Pick<ChatRequest, "messages">> & ChatRequest;
  response: ChatCompletion;
}) {
  const { uid, conversationId, request, response } = params;

  const conversationRef = adminDb
    .collection("users")
    .doc(uid)
    .collection("conversations")
    .doc(conversationId);

  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(conversationRef);
    const now = FieldValue.serverTimestamp();

    if (!snap.exists) {
      tx.set(conversationRef, {
        createdAt: now,
        updatedAt: now,
        lastProvider: response.provider,
        lastModel: response.model,
      });
      return;
    }

    tx.set(
      conversationRef,
      {
        updatedAt: now,
        lastProvider: response.provider,
        lastModel: response.model,
      },
      { merge: true },
    );
  });

  await conversationRef.collection("messages").add({
    request: request.messages,
    response: response.message,
    provider: response.provider,
    model: response.model,
    usage: response.usage,
    createdAt: FieldValue.serverTimestamp(),
  });
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  applyCors(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  try {
    const token = extractBearerToken(req.headers?.authorization);

    if (!token) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: "Necesitás iniciar sesión para usar el chat." }));
      return;
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const chatRequest = parseChatRequest(req.body);
    const completion = await callProvider(chatRequest);

    await persistExchange({
      uid: decoded.uid,
      conversationId: chatRequest.conversationId,
      request: chatRequest,
      response: completion,
    });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(completion));
  } catch (error) {
    if (error instanceof RateLimitError) {
      res.statusCode = 429;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: error.message, retryAfterSeconds: error.retryAfterSeconds }));
      return;
    }

    const message = error instanceof Error ? error.message : "Error interno al generar la respuesta del chat.";

    res.statusCode = message.includes("Token") || message.includes("sesión") ? 401 : 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: message }));
  }
}
