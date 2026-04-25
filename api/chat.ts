import { applyCorsHeaders } from "./_modules/shared/http/cors.js";
import { handleChatHttp } from "./_modules/chat/presentation/http/chat.http.js";

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

export default async function handler(req: RequestLike, res: ResponseLike) {
  applyCorsHeaders(res, "POST, OPTIONS");
  await handleChatHttp(req, res);
}

