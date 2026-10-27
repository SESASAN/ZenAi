import type { ChatHttpDependencies } from "../_modules/chat/presentation/http/chat.http.js";
import { applyCorsHeaders } from "../_modules/shared/http/cors.js";
import { sendJson, sendNoContent } from "../_modules/shared/http/json.js";
import type { HttpRequest, HttpResponse } from "../_modules/shared/http/types.js";

/**
 * Answers CORS preflights without touching Firebase, then loads the production dependencies.
 * If the backend is misconfigured (e.g. a malformed FIREBASE_SERVICE_ACCOUNT_JSON), the browser
 * gets a JSON 500 with CORS headers instead of a crashed function, and the logs say what to fix.
 */
export async function withDependencies(
  req: HttpRequest,
  res: HttpResponse,
  allowMethods: string,
  run: (deps: ChatHttpDependencies) => Promise<void>,
) {
  if (!applyCorsHeaders(req, res, allowMethods)) {
    sendJson(res, 403, { error: "Origin not allowed." });
    return;
  }
  if (req.method === "OPTIONS") {
    sendNoContent(res);
    return;
  }

  let deps: ChatHttpDependencies;
  try {
    // Dynamic import so a failure while loading firebase-admin is caught here too.
    const { getDependencies } = await import("./dependencies.js");
    deps = getDependencies();
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`[zenai] Backend configuration error: ${reason}`);
    sendJson(res, 500, { error: "Server is not configured correctly." });
    return;
  }

  await run(deps);
}
