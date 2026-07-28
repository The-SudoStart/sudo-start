import { ChatWithAIInput, ChatWithAIOutput } from '@/application/dto/chat-message.dto';

export interface ChatWithAIPort {
  execute(input: ChatWithAIInput): Promise<ChatWithAIOutput>;
}
