import { verifyFirebaseIdToken } from "../_modules/auth/application/verifyFirebaseIdToken.js";
import type { ChatHttpDependencies } from "../_modules/chat/presentation/http/chat.http.js";
import { openChatCompletionStream } from "../_modules/chat/infrastructure/llm/requestChatCompletion.js";
import { FirestoreConversationRepository } from "../_modules/conversations/infrastructure/firestoreConversationRepository.js";
import { readRateLimitConfig } from "../_modules/rateLimit/domain/rateLimit.js";
import { FirestoreRateLimiter } from "../_modules/rateLimit/infrastructure/firestoreRateLimiter.js";
import { getAdminDb } from "./firebaseAdmin.js";

let cached: ChatHttpDependencies | undefined;

/** Production wiring (Firebase Admin + real LLM providers). */
export function getDependencies(): ChatHttpDependencies {
  if (!cached) {
    const db = getAdminDb();
    cached = {
      verifyToken: verifyFirebaseIdToken,
      conversations: new FirestoreConversationRepository(db),
      rateLimiter: new FirestoreRateLimiter(db, readRateLimitConfig()),
      openStream: (request, signal) => openChatCompletionStream(request, { signal }),
    };
  }
  return cached;
}
