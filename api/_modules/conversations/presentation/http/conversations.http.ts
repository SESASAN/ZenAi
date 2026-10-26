import { authenticateRequest } from "../../../auth/application/authenticateRequest.js";
import type { TokenVerifier } from "../../../auth/domain/auth.types.js";
import { CONVERSATION_ID_PATTERN } from "../../../chat/domain/chat.limits.js";
import { ChatValidationError, NotFoundError } from "../../../chat/domain/chat.errors.js";
import { applyCorsHeaders } from "../../../shared/http/cors.js";
import { toErrorResponse } from "../../../shared/http/errorResponse.js";
import { sendJson, sendNoContent } from "../../../shared/http/json.js";
import { getQueryParam, type HttpRequest, type HttpResponse } from "../../../shared/http/types.js";
import type { ConversationRepository } from "../../domain/conversation.types.js";

export type ConversationsHttpDependencies = {
  conversations: ConversationRepository;
  verifyToken: TokenVerifier;
  env?: Record<string, string | undefined>;
  log?: (...args: unknown[]) => void;
};

function readConversationId(req: HttpRequest) {
  const id = getQueryParam(req, "id");
  if (id === null) return null;
  if (!CONVERSATION_ID_PATTERN.test(id)) throw new ChatValidationError("Invalid conversation id.");
  return id;
}

/**
 * GET    /api/conversations         -> { conversations: ConversationSummary[] }
 * GET    /api/conversations?id=<id> -> { conversation: ConversationDetail }
 * DELETE /api/conversations?id=<id> -> 204
 */
export async function handleConversationsHttp(
  req: HttpRequest,
  res: HttpResponse,
  deps: ConversationsHttpDependencies,
) {
  if (!applyCorsHeaders(req, res, "GET, DELETE, OPTIONS", deps.env)) {
    sendJson(res, 403, { error: "Origin not allowed." });
    return;
  }
  if (req.method === "OPTIONS") {
    sendNoContent(res);
    return;
  }
  if (req.method !== "GET" && req.method !== "DELETE") {
    res.setHeader("Allow", "GET, DELETE, OPTIONS");
    sendJson(res, 405, { error: "Method Not Allowed" });
    return;
  }

  try {
    const { uid } = await authenticateRequest(req, deps.verifyToken);
    const conversationId = readConversationId(req);

    if (req.method === "DELETE") {
      if (!conversationId) throw new ChatValidationError("Missing conversation id.");
      const deleted = await deps.conversations.delete(uid, conversationId);
      if (!deleted) throw new NotFoundError("Conversation not found.");
      sendNoContent(res);
      return;
    }

    if (conversationId) {
      const conversation = await deps.conversations.get(uid, conversationId);
      if (!conversation) throw new NotFoundError("Conversation not found.");
      sendJson(res, 200, { conversation });
      return;
    }

    sendJson(res, 200, { conversations: await deps.conversations.list(uid) });
  } catch (error) {
    const { status, body } = toErrorResponse(error, deps.log);
    sendJson(res, status, body);
  }
}
