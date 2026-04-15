import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import { parseChatRequest } from "./chat/application/chat-request.validator.js";
import { ChatService, type ChatLogRepository } from "./chat/application/chat.service.js";
import { ChatValidationError, ProviderConfigurationError, ProviderRequestError } from "./chat/domain/chat.errors.js";
import { createProviderRegistry, DEFAULT_PROVIDER } from "./chat/infrastructure/providers/provider-registry.js";

const port = Number(process.env.CHAT_BACKEND_PORT ?? 3001);

class NoopChatLogRepository implements ChatLogRepository {
  async saveExchange(): Promise<void> {
    return;
  }
}

const chatService = new ChatService(
  createProviderRegistry({
    groqApiKey: process.env.GROQ_API_KEY,
    cerebrasApiKey: process.env.CEREBRAS_API_KEY,
  }),
  DEFAULT_PROVIDER,
  new NoopChatLogRepository(),
);

function setJsonHeaders(response: ServerResponse, statusCode = 200) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8").trim();

  if (!rawBody) {
    return {};
  }

  return JSON.parse(rawBody) as unknown;
}

const server = createServer(async (request, response) => {
  if (!request.url) {
    setJsonHeaders(response, 400);
    response.end(JSON.stringify({ error: "Missing request URL." }));
    return;
  }

  if (request.method === "OPTIONS") {
    setJsonHeaders(response, 204);
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    setJsonHeaders(response, 200);
    response.end(JSON.stringify({ ok: true, service: "zenai-local-chat-backend" }));
    return;
  }

  if (request.method !== "POST" || request.url !== "/chat") {
    setJsonHeaders(response, 404);
    response.end(JSON.stringify({ error: "Route not found." }));
    return;
  }

  try {
    const body = await readJsonBody(request);
    const chatRequest = parseChatRequest(body);
    const completion = await chatService.execute(chatRequest);

    setJsonHeaders(response, 200);
    response.end(JSON.stringify(completion));
  } catch (error) {
    if (error instanceof SyntaxError) {
      setJsonHeaders(response, 400);
      response.end(JSON.stringify({ error: "El body debe ser JSON válido." }));
      return;
    }

    if (error instanceof ChatValidationError) {
      setJsonHeaders(response, 400);
      response.end(JSON.stringify({ error: error.message }));
      return;
    }

    if (error instanceof ProviderConfigurationError) {
      setJsonHeaders(response, 500);
      response.end(JSON.stringify({ error: error.message }));
      return;
    }

    if (error instanceof ProviderRequestError) {
      setJsonHeaders(response, 502);
      response.end(JSON.stringify({ error: error.message }));
      return;
    }

    setJsonHeaders(response, 500);
    response.end(JSON.stringify({ error: "Unexpected local backend error." }));
  }
});

server.listen(port, () => {
  console.log(`[zenai-local-backend] running on http://localhost:${port}`);
  console.log("[zenai-local-backend] routes: GET /health, POST /chat");
});
