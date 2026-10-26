import { authenticateRequest } from "../../../auth/application/authenticateRequest.js";
import type { TokenVerifier } from "../../../auth/domain/auth.types.js";
import { applyCorsHeaders } from "../../../shared/http/cors.js";
import { toErrorResponse } from "../../../shared/http/errorResponse.js";
import { sendJson, sendNoContent } from "../../../shared/http/json.js";
import type { HttpRequest, HttpResponse } from "../../../shared/http/types.js";
import { executeChat, type ChatDependencies } from "../../application/executeChat.js";
import { parseChatRequest } from "../../application/parseChatRequest.js";

export type ChatHttpDependencies = ChatDependencies & {
  verifyToken: TokenVerifier;
  env?: Record<string, string | undefined>;
};

/** Stream events, one JSON object per line (application/x-ndjson). */
export type ChatStreamEvent =
  | { type: "delta"; content: string }
  | ({ type: "done" } & Awaited<ReturnType<typeof executeChat>>)
  | { type: "error"; status: number; error: string; retryAfterSeconds?: number };

function startStream(res: HttpResponse) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
}

function writeEvent(res: HttpResponse, event: ChatStreamEvent) {
  res.write?.(`${JSON.stringify(event)}\n`);
}

export async function handleChatHttp(req: HttpRequest, res: HttpResponse, deps: ChatHttpDependencies) {
  if (!applyCorsHeaders(req, res, "POST, OPTIONS", deps.env)) {
    sendJson(res, 403, { error: "Origin not allowed." });
    return;
  }
  if (req.method === "OPTIONS") {
    sendNoContent(res);
    return;
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    sendJson(res, 405, { error: "Method Not Allowed" });
    return;
  }

  const abort = new AbortController();
  res.on?.("close", () => {
    if (!res.writableEnded) abort.abort();
  });

  let streamStarted = false;

  try {
    const { uid } = await authenticateRequest(req, deps.verifyToken);
    const request = parseChatRequest(req.body);
    const canStream = request.stream && typeof res.write === "function";

    const result = await executeChat({
      uid,
      request,
      deps,
      signal: abort.signal,
      onDelta: canStream
        ? (content) => {
            if (!streamStarted) {
              startStream(res);
              streamStarted = true;
            }
            writeEvent(res, { type: "delta", content });
          }
        : undefined,
    });

    if (canStream) {
      if (!streamStarted) startStream(res);
      writeEvent(res, { type: "done", ...result });
      res.end();
      return;
    }

    sendJson(res, 200, result);
  } catch (error) {
    if (abort.signal.aborted) {
      if (!res.writableEnded) res.end();
      return;
    }

    const { status, body } = toErrorResponse(error, deps.log);
    if (streamStarted) {
      writeEvent(res, { type: "error", status, ...body });
      res.end();
      return;
    }
    sendJson(res, status, body);
  }
}
