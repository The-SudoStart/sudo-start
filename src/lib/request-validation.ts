export class RequestValidationError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export async function readJsonBody(request: Request, maxBytes: number): Promise<unknown> {
  const declaredLength = Number(request.headers.get('content-length'));
  if (declaredLength > maxBytes) throw new RequestValidationError('Request body too large', 413);
  if (!request.body) throw new RequestValidationError('Request body is required');

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) {
        void reader.cancel();
        throw new RequestValidationError('Request body too large', 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const data = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    data.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(data));
  } catch {
    throw new RequestValidationError('Invalid JSON');
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isBoundedString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length <= maxLength;
}
