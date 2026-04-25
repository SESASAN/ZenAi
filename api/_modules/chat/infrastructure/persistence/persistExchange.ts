import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../../../../_shared/firebaseAdmin.js";
import type { ChatCompletion, ChatRequest } from "../../domain/chat.types.js";

export async function persistExchange(params: {
  uid: string;
  conversationId: string;
  request: Required<Pick<ChatRequest, "messages">> & ChatRequest;
  response: ChatCompletion;
}) {
  const { uid, conversationId, request, response } = params;

  const conversationRef = adminDb
    .collection("users")
    .doc(uid)
    .collection("conversations")
    .doc(conversationId);

  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(conversationRef);
    const now = FieldValue.serverTimestamp();

    if (!snap.exists) {
      tx.set(conversationRef, {
        createdAt: now,
        updatedAt: now,
        lastProvider: response.provider,
        lastModel: response.model,
      });
      return;
    }

    tx.set(
      conversationRef,
      {
        updatedAt: now,
        lastProvider: response.provider,
        lastModel: response.model,
      },
      { merge: true },
    );
  });

  await conversationRef.collection("messages").add({
    request: request.messages,
    response: response.message,
    provider: response.provider,
    model: response.model,
    usage: response.usage,
    createdAt: FieldValue.serverTimestamp(),
  });
}
