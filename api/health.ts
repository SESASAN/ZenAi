import { applyCorsHeaders } from "./_modules/shared/http/cors.js";
import { sendJson, sendNoContent } from "./_modules/shared/http/json.js";
import type { HttpRequest, HttpResponse } from "./_modules/shared/http/types.js";

export default async function handler(req: HttpRequest, res: HttpResponse) {
  if (!applyCorsHeaders(req, res, "GET, OPTIONS")) {
    sendJson(res, 403, { error: "Origin not allowed." });
    return;
  }
  if (req.method === "OPTIONS") {
    sendNoContent(res);
    return;
  }
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method Not Allowed" });
    return;
  }

  sendJson(res, 200, { ok: true, service: "zenai-vercel-backend" });
}
