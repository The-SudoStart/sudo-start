import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir, readdir, stat, unlink, chmod } from 'fs/promises';
import { randomInt } from 'crypto';
import path from 'path';
import os from 'os';
import { enforceRateLimit, getClientIP, isValidScriptId } from '@/lib/security';
import { hasSharedRedis, redisCommand } from '@/lib/redis-rest';
import { isBoundedString, isRecord, readJsonBody, RequestValidationError } from '@/lib/request-validation';

const STORE_DIR = process.env.SUDOSTART_STORE_DIR
  || path.join(os.tmpdir(), 'sudostart-scripts');
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
let lastCleanup = 0;

// Rate limit: 20 requests per minute per IP for POST, 60 for GET
const RATE_LIMIT_POST_MAX = 20;
const RATE_LIMIT_GET_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

interface ScriptEntry {
  script: string;
  createdAt: number;
  meta: { os: string; packages: string[] };
}

async function ensureDir() {
  await mkdir(STORE_DIR, { recursive: true, mode: 0o700 });
  await chmod(STORE_DIR, 0o700);
}

function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 10; i++) {
    id += chars[randomInt(chars.length)];
  }
  return id;
}

async function readEntry(id: string): Promise<ScriptEntry | null> {
  if (!isValidScriptId(id)) return null;
  let raw: string | null;
  if (hasSharedRedis()) {
    raw = await redisCommand<string | null>('GET', `sudostart:script:${id}`);
  } else {
    if (process.env.NODE_ENV === 'production') throw new Error('Shared Redis is required for script sharing');
    try {
      raw = await readFile(path.join(STORE_DIR, `${id}.json`), 'utf-8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }
  if (!raw) return null;
  const entry: ScriptEntry = JSON.parse(raw);
  if (Date.now() - entry.createdAt > TTL_MS) {
    if (!hasSharedRedis()) await unlink(path.join(STORE_DIR, `${id}.json`)).catch(() => {});
    return null;
  }
  return entry;
}

async function cleanupLocalStore() {
  if (Date.now() - lastCleanup < 10 * 60 * 1000) return;
  lastCleanup = Date.now();
  for (const file of await readdir(/* turbopackIgnore: true */ STORE_DIR)) {
    if (!/^[a-z0-9]{10}\.json$/.test(file)) continue;
    const filename = path.join(STORE_DIR, file);
    try {
      const info = await stat(filename);
      if (Date.now() - info.mtimeMs > TTL_MS) await unlink(filename);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
}

async function writeEntry(entry: ScriptEntry): Promise<string> {
  if (hasSharedRedis()) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const id = generateId();
      const result = await redisCommand<string | null>(
        'SET', `sudostart:script:${id}`, JSON.stringify(entry), 'EX', 86400, 'NX'
      );
      if (result === 'OK') return id;
    }
    throw new Error('Could not allocate script ID');
  }
  if (process.env.NODE_ENV === 'production') throw new Error('Shared Redis is required for script sharing');
  await ensureDir();
  await cleanupLocalStore();
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = generateId();
    try {
      await writeFile(path.join(STORE_DIR, `${id}.json`), JSON.stringify(entry), {
        encoding: 'utf-8', mode: 0o600, flag: 'wx',
      });
      return id;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }
  }
  throw new Error('Could not allocate script ID');
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Rate limiting check
    const clientIP = getClientIP(request);
    const rateLimit = await enforceRateLimit(`script-share:post:${clientIP}`, RATE_LIMIT_POST_MAX, RATE_LIMIT_WINDOW_MS);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(RATE_LIMIT_POST_MAX),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
          }
        }
      );
    }

    const body = await readJsonBody(request, 1100 * 1024);
    if (!isRecord(body)) throw new RequestValidationError('Invalid request body');
    const { script, os: osName, packages } = body;
    
    // SECURITY: Validate script is a string and has reasonable length
    if (!isBoundedString(script, 1024 * 1024) || !script) {
      return NextResponse.json({ error: 'Invalid script' }, { status: 400 });
    }
    
    // SECURITY: Limit script size (max 1MB)
    if (packages !== undefined && (!Array.isArray(packages) || packages.length > 100 ||
        !packages.every(p => isBoundedString(p, 100)))) {
      return NextResponse.json({ error: 'Invalid packages format' }, { status: 400 });
    }
    if (osName !== undefined && !['macos', 'linux'].includes(String(osName))) {
      throw new RequestValidationError('Invalid OS');
    }

    const id = await writeEntry({
      script,
      createdAt: Date.now(),
      meta: { os: typeof osName === 'string' ? osName : 'unknown', packages: packages ?? [] },
    });

    return NextResponse.json({ id }, {
      headers: {
        'X-RateLimit-Limit': String(RATE_LIMIT_POST_MAX),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
      }
    });
  } catch (err) {
    if (err instanceof RequestValidationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('script-share POST error:', err);
    return NextResponse.json({ error: 'Failed to store script' }, {
      status: err instanceof Error && err.message.includes('Shared Redis') ? 503 : 500,
    });
  }
}

export async function GET(request: NextRequest) {
  // SECURITY: Rate limiting check
  const clientIP = getClientIP(request);
  let rateLimit;
  try {
    rateLimit = await enforceRateLimit(`script-share:get:${clientIP}`, RATE_LIMIT_GET_MAX, RATE_LIMIT_WINDOW_MS);
  } catch {
    return NextResponse.json({ error: 'Rate limiting unavailable' }, { status: 503 });
  }
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT_GET_MAX),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
        }
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  // SECURITY: Validate ID format before reading
  if (!isValidScriptId(id)) {
    return NextResponse.json({ error: 'Invalid id format' }, { status: 400 });
  }

  let entry;
  try {
    entry = await readEntry(id);
  } catch {
    return NextResponse.json({ error: 'Script storage unavailable' }, { status: 503 });
  }
  if (!entry) {
    const ua = request.headers.get('user-agent') ?? '';
    const isCli = ua.toLowerCase().includes('curl') || ua.toLowerCase().includes('wget');
    if (isCli) {
      return new NextResponse(
        `#!/bin/bash\necho "Error: Script not found or expired (24h TTL)"\nexit 1\n`,
        {
          status: 404,
          headers: {
            'Content-Type': 'text/plain',
            'X-RateLimit-Limit': String(RATE_LIMIT_GET_MAX),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
          }
        }
      );
    }
    return NextResponse.json({ error: 'Script not found or expired' }, {
      status: 404,
      headers: {
        'X-RateLimit-Limit': String(RATE_LIMIT_GET_MAX),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
      }
    });
  }

  const ua = request.headers.get('user-agent') ?? '';
  const raw = searchParams.get('raw') === '1';
  const isCli =
    ua.toLowerCase().includes('curl') ||
    ua.toLowerCase().includes('wget') ||
    raw;

  if (isCli) {
    return new NextResponse(entry.script, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="sudo-start-setup.sh"',
        'X-Script-OS': entry.meta.os,
        'X-Script-Packages': entry.meta.packages.length.toString(),
        'X-RateLimit-Limit': String(RATE_LIMIT_GET_MAX),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
      },
    });
  }

  return NextResponse.json({
    script: entry.script,
    meta: entry.meta,
    createdAt: entry.createdAt,
    expiresAt: entry.createdAt + TTL_MS,
  }, {
    headers: {
      'X-RateLimit-Limit': String(RATE_LIMIT_GET_MAX),
      'X-RateLimit-Remaining': String(rateLimit.remaining),
      'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
    }
  });
}
