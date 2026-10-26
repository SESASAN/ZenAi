import { handleChatHttp } from "./_modules/chat/presentation/http/chat.http.js";
import type { HttpRequest, HttpResponse } from "./_modules/shared/http/types.js";
import { getDependencies } from "./_shared/dependencies.js";

export default async function handler(req: HttpRequest, res: HttpResponse) {
  await handleChatHttp(req, res, getDependencies());
}
