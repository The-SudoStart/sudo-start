import { test, expect } from '@playwright/test';
import { NextRequest } from 'next/server';
import { POST as shareScript, GET as readScript } from '../src/app/api/script-share/route';
import { POST as chat } from '../src/app/api/chat/route';
import { GET as searchRegistry } from '../src/app/api/registry/route';
import { getClientIP } from '../src/lib/security';
import { isSafeRegistryResult } from '../src/lib/registries/validation';
import { registryAdapters } from '../src/lib/registries';
import { buildChatRequest, MAX_CHAT_BODY_BYTES } from '../src/lib/chat-request';

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

test('custom proxies cannot let clients override the rate-limit identity with a Vercel header', () => {
  const oldVercel = process.env.VERCEL;
  const oldProxy = process.env.SUDOSTART_TRUST_PROXY;
  delete process.env.VERCEL;
  process.env.SUDOSTART_TRUST_PROXY = 'true';
  try {
    const request = new Request('http://localhost/api/chat', {
      headers: { 'x-forwarded-for': '203.0.113.10', 'x-vercel-forwarded-for': '198.51.100.1' },
    });
    expect(getClientIP(request)).toBe('203.0.113.10');
  } finally {
    if (oldVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = oldVercel;
    if (oldProxy === undefined) delete process.env.SUDOSTART_TRUST_PROXY;
    else process.env.SUDOSTART_TRUST_PROXY = oldProxy;
  }
});

test('long chat histories fit the API limits while keeping the latest user message', () => {
  const history = Array.from({ length: 60 }, (_, index) => ({
    role: index % 2 ? 'user' as const : 'assistant' as const,
    content: '😀'.repeat(4000),
  }));
  const body = buildChatRequest(history, { role: 'user', content: 'latest question' }, []);
  expect(body.messages.at(-1)).toEqual({ role: 'user', content: 'latest question' });
  expect(body.messages.length).toBeLessThanOrEqual(30);
  expect(body.messages.every((message) => message.content.length <= 4000)).toBe(true);
  expect(new TextEncoder().encode(JSON.stringify(body)).byteLength).toBeLessThanOrEqual(MAX_CHAT_BODY_BYTES);
});

test('registry validation retains safe Homebrew and APT results and rejects shell characters', async () => {
  const originalSearch = registryAdapters.homebrew.search;
  registryAdapters.homebrew.search = async () => [
    { name: 'ruby@3.3', version: '3.3.1', description: 'Ruby formula' },
    { name: 'bad;touch', version: '1.0', description: 'Unsafe formula' },
  ];
  try {
    const response = await searchRegistry(new NextRequest(
      'http://localhost/api/registry?registry=homebrew&q=ruby'
    ));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.packages.map((pkg: { name: string }) => pkg.name)).toEqual(['ruby@3.3']);
  } finally {
    registryAdapters.homebrew.search = originalSearch;
  }
  expect(isSafeRegistryResult('apt', {
    name: 'libfoo', version: '1:2.0-3+deb11u1', description: 'APT package',
  })).toBe(true);
});
