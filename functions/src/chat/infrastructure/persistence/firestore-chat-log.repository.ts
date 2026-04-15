import { FieldValue } from "firebase-admin/firestore";

import type { ChatCompletion, ChatRequest } from "../../domain/chat.types.js";
import { adminDb } from "../../../shared/firebase/admin.js";
import type { ChatLogRepository } from "../../application/chat.service.js";

export class FirestoreChatLogRepository implements ChatLogRepository {
  constructor(private readonly uid: string) {}

  async saveExchange(input: {
    conversationId?: string;
    request: ChatRequest;
    response: ChatCompletion;
  }): Promise<void> {
    if (!input.conversationId) {
      return;
    }

    const conversationRef = adminDb
      .collection("users")
      .doc(this.uid)
      .collection("conversations")
      .doc(input.conversationId);

    await conversationRef.set(
      {
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
        lastProvider: input.response.provider,
        lastModel: input.response.model,
      },
      { merge: true },
    );

    await conversationRef.collection("messages").add({
        request: input.request.messages,
        response: input.response.message,
        provider: input.response.provider,
        model: input.response.model,
        usage: input.response.usage,
        createdAt: FieldValue.serverTimestamp(),
      });
  }
}
