export type HttpRequest = {
  method?: string;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
};

export type HttpResponse = {
  statusCode: number;
  writableEnded?: boolean;
  setHeader(name: string, value: string): void;
  write?(chunk: string): unknown;
  end(body?: string): void;
  on?(event: "close", listener: () => void): unknown;
  flushHeaders?(): void;
};

export function getHeader(req: HttpRequest, name: string): string | undefined {
  const headers = req.headers ?? {};
  const value = headers[name.toLowerCase()] ?? headers[name];
  return Array.isArray(value) ? value[0] : value;
}

export function getQueryParam(req: HttpRequest, name: string): string | null {
  if (!req.url) return null;
  return new URL(req.url, "http://localhost").searchParams.get(name);
}
