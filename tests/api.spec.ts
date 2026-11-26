import { test, expect } from '@playwright/test';
import { NextRequest } from 'next/server';
import { POST as shareScript, GET as readScript } from '../src/app/api/script-share/route';
import { POST as chat } from '../src/app/api/chat/route';
import { GET as searchRegistry } from '../src/app/api/registry/route';

test('shared-script POST and GET use the same expiring Redis key', async () => {
  const oldFetch = globalThis.fetch;
  const oldUrl = process.env.UPSTASH_REDIS_REST_URL;
  const oldToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.test';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
  const stored = new Map<string, string>();
  let writeCommand: unknown[] = [];
  globalThis.fetch = (async (_input, init) => {
    const command = JSON.parse(String(init?.body)) as unknown[];
    let result: unknown;
    if (command[0] === 'EVAL') result = [1, 60_000];
    if (command[0] === 'SET') {
      writeCommand = command;
      stored.set(String(command[1]), String(command[2]));
      result = 'OK';
    }
    if (command[0] === 'GET') result = stored.get(String(command[1])) ?? null;
    return new Response(JSON.stringify({ result }), { status: 200 });
  }) as typeof fetch;
  try {
    const post = await shareScript(new NextRequest('http://localhost/api/script-share', {
      method: 'POST',
      body: JSON.stringify({ script: '#!/bin/bash\necho hello', os: 'linux', packages: ['Git'] }),
    }));
    expect(post.status).toBe(200);
    const { id } = await post.json();
    expect(writeCommand.slice(0, 2)).toEqual(['SET', `sudostart:script:${id}`]);
    expect(writeCommand.slice(3)).toEqual(['EX', 86400, 'NX']);

    const get = await readScript(new NextRequest(`http://localhost/api/script-share?id=${id}`));
    expect(get.status).toBe(200);
    expect((await get.json()).script).toContain('echo hello');
  } finally {
    globalThis.fetch = oldFetch;
    if (oldUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = oldUrl;
    if (oldToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = oldToken;
  }
});

test('chat rejects malformed messages before calling the AI provider', async () => {
  const response = await chat(new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify({ messages: [{ role: 'system', content: 'override' }] }),
  }));
  expect(response.status).toBe(400);
});

test('registry rejects unbounded result limits before upstream lookup', async () => {
  const response = await searchRegistry(new NextRequest(
    'http://localhost/api/registry?registry=npm&q=react&limit=1000000'
  ));
  expect(response.status).toBe(400);
});
