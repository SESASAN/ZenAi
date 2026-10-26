import { handleConversationsHttp } from "./_modules/conversations/presentation/http/conversations.http.js";
import type { HttpRequest, HttpResponse } from "./_modules/shared/http/types.js";
import { getDependencies } from "./_shared/dependencies.js";

export default async function handler(req: HttpRequest, res: HttpResponse) {
  await handleConversationsHttp(req, res, getDependencies());
}
