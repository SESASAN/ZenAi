import type { ChatCompletion, ChatProvider, ChatRequest } from "../domain/chat.types.js";

export interface ChatLogRepository {
  saveExchange(input: {
    conversationId?: string;
    request: ChatRequest;
    response: ChatCompletion;
  }): Promise<void>;
}

export class ChatService {
  constructor(
    private readonly providerRegistry: Map<string, ChatProvider>,
    private readonly fallbackProviderName: string,
    private readonly chatLogRepository: ChatLogRepository,
  ) {}

  async execute(request: ChatRequest): Promise<ChatCompletion> {
    const providerName = request.provider ?? this.fallbackProviderName;
    const provider = this.providerRegistry.get(providerName);

    if (!provider) {
      throw new Error(`No existe un provider registrado para: ${providerName}`);
    }

    const response = await provider.generateReply({
      ...request,
      provider: providerName as ChatRequest["provider"],
    });

    await this.chatLogRepository.saveExchange({
      conversationId: request.conversationId,
      request,
      response,
    });

    return response;
  }
}
