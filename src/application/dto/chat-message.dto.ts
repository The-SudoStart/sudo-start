import { ChatMessage } from '@/types';

export interface ChatWithAIInput {
  messages: ChatMessage[];
  bucketContext: string[];
}

export interface ChatWithAIOutput {
  stream: ReadableStream<Uint8Array>;
}
