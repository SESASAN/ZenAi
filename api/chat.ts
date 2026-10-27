import { handleChatHttp } from "./_modules/chat/presentation/http/chat.http.js";
import type { HttpRequest, HttpResponse } from "./_modules/shared/http/types.js";
import { withDependencies } from "./_shared/withDependencies.js";

export default async function handler(req: HttpRequest, res: HttpResponse) {
  await withDependencies(req, res, "POST, OPTIONS", (deps) => handleChatHttp(req, res, deps));
}
