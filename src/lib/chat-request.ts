import type { ChatMessage } from '@/types';

export const MAX_CHAT_MESSAGES = 30;
export const MAX_CHAT_MESSAGE_LENGTH = 4000;
export const MAX_CHAT_BODY_BYTES = 128 * 1024;

/** Keep recent context within the API's message and byte limits. */
export function buildChatRequest(
  history: ChatMessage[],
  userMessage: ChatMessage,
  bucketContext: string[]
): { messages: ChatMessage[]; bucketContext: string[] } {
  const messages = history.slice(-(MAX_CHAT_MESSAGES - 1)).map((message) => ({
    role: message.role,
    content: message.content.slice(0, MAX_CHAT_MESSAGE_LENGTH),
  }));
  messages.push(userMessage);
  const body = { messages, bucketContext };
  const encoder = new TextEncoder();
  while (messages.length > 1 && encoder.encode(JSON.stringify(body)).byteLength > MAX_CHAT_BODY_BYTES) {
    messages.shift();
  }
  return body;
}
