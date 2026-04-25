import { AuthRequiredError, InvalidTokenError } from "../../../auth/domain/auth.errors.js";
import { verifyFirebaseIdToken } from "../../../auth/application/verifyFirebaseIdToken.js";
import { extractBearerToken } from "../../../shared/http/bearerToken.js";
import { ChatValidationError, ProviderConfigurationError, ProviderRequestError, RateLimitError } from "../../domain/chat.errors.js";
import { parseChatRequest } from "../../application/parseChatRequest.js";
import { executeChat } from "../../application/executeChat.js";

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

function json(res: ResponseLike, statusCode: number, body: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export async function handleChatHttp(req: RequestLike, res: ResponseLike) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    json(res, 405, { error: "Method Not Allowed" });
    return;
  }

  try {
    const token = extractBearerToken(req.headers?.authorization);
    if (!token) {
      throw new AuthRequiredError();
    }

    const decoded = await verifyFirebaseIdToken(token);
    const chatRequest = parseChatRequest(req.body);
    const completion = await executeChat({ uid: decoded.uid, request: chatRequest });

    json(res, 200, completion);
  } catch (error) {
    if (error instanceof RateLimitError) {
      json(res, 429, { error: error.message, retryAfterSeconds: error.retryAfterSeconds });
      return;
    }

    if (error instanceof ChatValidationError) {
      json(res, 400, { error: error.message });
      return;
    }

    if (error instanceof AuthRequiredError || error instanceof InvalidTokenError) {
      const message = error instanceof Error ? error.message : "Necesitás iniciar sesión para usar el chat.";
      json(res, 401, { error: message });
      return;
    }

    if (error instanceof ProviderConfigurationError) {
      json(res, 500, { error: error.message });
      return;
    }

    if (error instanceof ProviderRequestError) {
      json(res, 502, { error: error.message });
      return;
    }

    const message = error instanceof Error ? error.message : "Error interno al generar la respuesta del chat.";
    json(res, 500, { error: message });
  }
}
