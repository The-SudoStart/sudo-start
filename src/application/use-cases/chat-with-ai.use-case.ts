import { ChatWithAIInput, ChatWithAIOutput } from '../dto/chat-message.dto';
import { ChatWithAIPort } from '../ports/incoming/chat-with-ai.port';
import { AIProvider } from '../ports/outgoing/ai-provider.port';

export class ChatWithAIUseCase implements ChatWithAIPort {
  constructor(private readonly aiProvider: AIProvider) {}

  async execute(input: ChatWithAIInput): Promise<ChatWithAIOutput> {
    if (!Array.isArray(input.messages)) {
      throw new Error('Invalid messages');
    }

    return {
      stream: await this.aiProvider.streamChat(input.messages, input.bucketContext),
    };
  }
}
