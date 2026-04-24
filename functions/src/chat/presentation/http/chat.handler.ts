/**
 * LEGACY (no canónico):
 * Handler HTTP para Firebase Functions. El runtime canónico del backend es Vercel (`api/*`).
 * Fase 2: mantener solo mientras migramos/consolidamos.
 * Ver: docs/adr/0001_backend_canonical_runtime_vercel.md
 */
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";

import { parseChatRequest } from "../../application/chat-request.validator.js";
import { ChatService } from "../../application/chat.service.js";
import { ChatValidationError, ProviderConfigurationError, ProviderRequestError } from "../../domain/chat.errors.js";
import { createProviderRegistry, DEFAULT_PROVIDER } from "../../infrastructure/providers/provider-registry.js";
import { FirestoreChatLogRepository } from "../../infrastructure/persistence/firestore-chat-log.repository.js";

const GROQ_API_KEY = defineSecret("GROQ_API_KEY");
const CEREBRAS_API_KEY = defineSecret("CEREBRAS_API_KEY");

type CorsResponse = {
  set(name: string, value: string): void;
};

function applyCorsHeaders(response: CorsResponse) {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
}

function extractBearerToken(authorizationHeader: string | undefined) {
  if (!authorizationHeader) return null;
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export const chat = onRequest(
  {
    cors: false,
    region: "us-central1",
    timeoutSeconds: 60,
    secrets: [GROQ_API_KEY, CEREBRAS_API_KEY],
  },
  async (request, response) => {
    applyCorsHeaders(response);

    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    if (request.method !== "POST") {
      response.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    try {
      const token = extractBearerToken(request.headers.authorization);

      if (!token) {
        response.status(401).json({ error: "Necesitás iniciar sesión para usar el chat." });
        return;
      }

      const decoded = await getAuth().verifyIdToken(token);

      const chatRequest = parseChatRequest(request.body);
      const providerRegistry = createProviderRegistry({
        groqApiKey: GROQ_API_KEY.value(),
        cerebrasApiKey: CEREBRAS_API_KEY.value(),
      });

      const chatService = new ChatService(
        providerRegistry,
        DEFAULT_PROVIDER,
        new FirestoreChatLogRepository(decoded.uid),
      );

      const completion = await chatService.execute(chatRequest);

      response.status(200).json(completion);
    } catch (error) {
      logger.error("chat handler failed", error);

      if (error instanceof Error && error.name === "FirebaseAuthError") {
        response.status(401).json({ error: "Token inválido o expirado." });
        return;
      }

      if (error instanceof ChatValidationError) {
        response.status(400).json({ error: error.message });
        return;
      }

      if (error instanceof ProviderConfigurationError) {
        response.status(500).json({ error: error.message });
        return;
      }

      if (error instanceof ProviderRequestError) {
        response.status(502).json({ error: error.message });
        return;
      }

      response.status(500).json({ error: "Error interno al generar la respuesta del chat." });
    }
  },
);
