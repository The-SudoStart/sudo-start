import { AIProvider } from '@/application/ports/outgoing/ai-provider.port';
import { ChatMessage } from '@/types';

export class OpenAIAdapter implements AIProvider {
  async streamChat(messages: ChatMessage[], bucketContext: string[]): Promise<ReadableStream<Uint8Array>> {
    void messages;
    void bucketContext;
    throw new Error('OpenAIAdapter is a future provider stub');
  }
}
