import { handleConversationsHttp } from "./_modules/conversations/presentation/http/conversations.http.js";
import type { HttpRequest, HttpResponse } from "./_modules/shared/http/types.js";
import { withDependencies } from "./_shared/withDependencies.js";

export default async function handler(req: HttpRequest, res: HttpResponse) {
  await withDependencies(req, res, "GET, DELETE, OPTIONS", (deps) => handleConversationsHttp(req, res, deps));
}
