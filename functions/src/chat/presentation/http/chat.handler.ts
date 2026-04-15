import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";

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
      const chatRequest = parseChatRequest(request.body);
      const providerRegistry = createProviderRegistry({
        groqApiKey: GROQ_API_KEY.value(),
        cerebrasApiKey: CEREBRAS_API_KEY.value(),
      });

      const chatService = new ChatService(
        providerRegistry,
        DEFAULT_PROVIDER,
        new FirestoreChatLogRepository(),
      );

      const completion = await chatService.execute(chatRequest);

      response.status(200).json(completion);
    } catch (error) {
      logger.error("chat handler failed", error);

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
