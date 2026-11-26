/** Minimal server-side client for Upstash's Redis REST command endpoint. */
export function hasSharedRedis(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export async function redisCommand<T>(...command: Array<string | number>): Promise<T> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Shared Redis is not configured');
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: { result?: T; error?: string } = await response.json();
    if (data.error) throw new Error(data.error);
    return data.result as T;
  } catch (error) {
    throw new Error('Shared Redis unavailable', { cause: error });
  }
}
