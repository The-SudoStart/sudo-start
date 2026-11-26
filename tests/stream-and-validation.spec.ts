import { test, expect } from '@playwright/test';
import { consumeJsonSse } from '../src/lib/sse';
import { readJsonBody, RequestValidationError } from '../src/lib/request-validation';

test('SSE decoder preserves events split at every byte, including Unicode', async () => {
  const bytes = new TextEncoder().encode('data: {"delta":"✓","done":false}\n\ndata: {"delta":"","done":true}\n\n');
  for (let split = 1; split < bytes.length; split++) {
    const events: Array<{ delta: string; done: boolean }> = [];
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes.slice(0, split));
        controller.enqueue(bytes.slice(split));
        controller.close();
      },
    });
    await consumeJsonSse(stream, (event: { delta: string; done: boolean }) => events.push(event));
    expect(events).toEqual([{ delta: '✓', done: false }, { delta: '', done: true }]);
  }
});

test('JSON reader bounds actual bytes even without Content-Length', async () => {
  const request = new Request('http://localhost/api/chat', {
    method: 'POST',
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"text":"123456789"}'));
        controller.close();
      },
    }),
    duplex: 'half',
  } as RequestInit);
  await expect(readJsonBody(request, 10)).rejects.toMatchObject({
    status: 413,
  } satisfies Partial<RequestValidationError>);
});
