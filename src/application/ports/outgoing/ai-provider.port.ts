import { ChatMessage } from '@/types';

export interface AIProvider {
  streamChat(messages: ChatMessage[], bucketContext: string[]): Promise<ReadableStream<Uint8Array>>;
}
