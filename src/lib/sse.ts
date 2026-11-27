/** Consume JSON data events while preserving lines split across network reads. */
export async function consumeJsonSse<T>(
  stream: ReadableStream<Uint8Array>,
  onEvent: (event: T) => void
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let pending = '';

  const processLines = (flush = false) => {
    const lines = pending.split(/\r?\n/);
    pending = flush ? '' : lines.pop() ?? '';
    for (const line of lines) {
      if (line.startsWith('data: ')) onEvent(JSON.parse(line.slice(6)) as T);
    }
    if (flush && pending.startsWith('data: ')) onEvent(JSON.parse(pending.slice(6)) as T);
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      pending += decoder.decode(value, { stream: true });
      processLines();
    }
    pending += decoder.decode();
    processLines(true);
  } finally {
    reader.releaseLock();
  }
}
