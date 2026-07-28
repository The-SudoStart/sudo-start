import { describe, expect, it, vi } from 'vitest';
import { ChatWithAIUseCase } from './chat-with-ai.use-case';
import { AIProvider } from '../ports/outgoing/ai-provider.port';

describe('ChatWithAIUseCase', () => {
  it('delegates streaming chat to the configured provider', async () => {
    const stream = new ReadableStream<Uint8Array>();
    const provider: AIProvider = {
      streamChat: vi.fn(async () => stream),
    };

    const result = await new ChatWithAIUseCase(provider).execute({
      messages: [{ role: 'user', content: 'hello' }],
      bucketContext: ['Git'],
    });

    expect(result.stream).toBe(stream);
    expect(provider.streamChat).toHaveBeenCalledWith(
      [{ role: 'user', content: 'hello' }],
      ['Git'],
    );
  });

  it('rejects invalid message payloads', async () => {
    const provider: AIProvider = {
      streamChat: vi.fn(),
    };

    await expect(new ChatWithAIUseCase(provider).execute({
      messages: null as never,
      bucketContext: [],
    })).rejects.toThrow('Invalid messages');
  });
});
