import type { HttpRequest, HttpResponse } from "../../api/_modules/shared/http/types";

export class FakeResponse implements HttpResponse {
  statusCode = 200;
  writableEnded = false;
  headers = new Map<string, string>();
  chunks: string[] = [];
  private closeListeners: Array<() => void> = [];

  setHeader(name: string, value: string) {
    this.headers.set(name.toLowerCase(), value);
  }

  write(chunk: string) {
    this.chunks.push(chunk);
    return true;
  }

  end(body?: string) {
    if (body !== undefined) this.chunks.push(body);
    this.writableEnded = true;
  }

  on(_event: "close", listener: () => void) {
    this.closeListeners.push(listener);
    return this;
  }

  /** Simulates the client disconnecting. */
  close() {
    this.closeListeners.forEach((listener) => listener());
  }

  get text() {
    return this.chunks.join("");
  }

  json<T = Record<string, unknown>>() {
    return JSON.parse(this.text) as T;
  }

  events<T = Record<string, unknown>>() {
    return this.text.split("\n").filter(Boolean).map((line) => JSON.parse(line) as T);
  }
}

export function makeRequest(overrides: Partial<HttpRequest> = {}): HttpRequest {
  return {
    method: "POST",
    url: "/api/chat",
    headers: { authorization: "Bearer token-user-1", origin: "https://sesasan.github.io" },
    ...overrides,
  };
}

/** Builds a fake OpenAI-compatible SSE response. */
export function sseResponse(chunks: unknown[], { splitEvery }: { splitEvery?: number } = {}) {
  const text = chunks
    .map((chunk) => `data: ${typeof chunk === "string" ? chunk : JSON.stringify(chunk)}\n\n`)
    .join("");
  const encoder = new TextEncoder();
  const pieces = splitEvery
    ? text.match(new RegExp(`[\\s\\S]{1,${splitEvery}}`, "g")) ?? []
    : [text];

  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        pieces.forEach((piece) => controller.enqueue(encoder.encode(piece)));
        controller.close();
      },
    }),
    { status: 200, headers: { "Content-Type": "text/event-stream" } },
  );
}

export function deltaChunk(content: string) {
  return { choices: [{ delta: { content } }] };
}
