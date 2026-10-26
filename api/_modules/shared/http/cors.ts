import { getHeader, type HttpRequest, type HttpResponse } from "./types.js";

/** Production frontend (GitHub Pages). Extra origins can be added with ALLOWED_ORIGINS. */
export const DEFAULT_ALLOWED_ORIGINS = ["https://sesasan.github.io"];

const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function getAllowedOrigins(env: Record<string, string | undefined> = process.env): string[] {
  const extra = (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  return [...DEFAULT_ALLOWED_ORIGINS, ...extra];
}

export function isOriginAllowed(origin: string, env: Record<string, string | undefined> = process.env) {
  const normalized = origin.replace(/\/+$/, "");
  if (LOCAL_ORIGIN.test(normalized)) return true;
  const allowed = getAllowedOrigins(env);
  return allowed.includes("*") || allowed.includes(normalized);
}

/**
 * Applies CORS headers for allowed origins.
 * Returns false when the request comes from a browser origin that is not allowed.
 * Requests without an Origin header (curl, server-to-server) are allowed; they still need a valid token.
 */
export function applyCorsHeaders(
  req: HttpRequest,
  res: HttpResponse,
  allowMethods: string,
  env: Record<string, string | undefined> = process.env,
): boolean {
  res.setHeader("Vary", "Origin");
  const origin = getHeader(req, "origin");
  if (!origin) return true;
  if (!isOriginAllowed(origin, env)) return false;

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", allowMethods);
  res.setHeader("Access-Control-Max-Age", "600");
  return true;
}
