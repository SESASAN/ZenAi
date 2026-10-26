import type { HttpResponse } from "./types.js";

export function sendJson(res: HttpResponse, statusCode: number, body: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export function sendNoContent(res: HttpResponse) {
  res.statusCode = 204;
  res.end();
}
