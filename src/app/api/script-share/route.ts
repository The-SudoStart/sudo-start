import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import os from 'os';
import { checkRateLimit, isValidScriptId, sanitizeScriptId } from '@/lib/security';

// SECURITY: Use a more secure directory (not world-readable /tmp)
// In production, use a dedicated directory with proper permissions
const STORE_DIR = process.env.SUDOSTART_STORE_DIR
  || path.join(os.tmpdir(), 'sudostart-scripts');
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Rate limit: 20 requests per minute per IP for POST, 60 for GET
const RATE_LIMIT_POST_MAX = 20;
const RATE_LIMIT_GET_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIP || 'unknown';
}

interface ScriptEntry {
  script: string;
  createdAt: number;
  meta: { os: string; packages: string[] };
}

async function ensureDir() {
  if (!existsSync(STORE_DIR)) {
    await mkdir(STORE_DIR, { recursive: true });
  }
}

function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 10; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

async function readEntry(id: string): Promise<ScriptEntry | null> {
  try {
    // SECURITY: Validate ID format before using in file path
    if (!isValidScriptId(id)) {
      console.warn(`[Security] Invalid script ID attempted: ${sanitizeScriptId(id)}`);
      return null;
    }
    
    // SECURITY: Use sanitized ID for file path
    const sanitizedId = sanitizeScriptId(id);
    const file = path.join(STORE_DIR, `${sanitizedId}.json`);
    
    // SECURITY: Verify the resolved path is within STORE_DIR (path traversal check)
    const resolvedPath = path.resolve(file);
    const resolvedStoreDir = path.resolve(STORE_DIR);
    if (!resolvedPath.startsWith(resolvedStoreDir)) {
      console.warn(`[Security] Path traversal attempt detected: ${id}`);
      return null;
    }
    
    const raw = await readFile(file, 'utf-8');
    const entry: ScriptEntry = JSON.parse(raw);
    if (Date.now() - entry.createdAt > TTL_MS) return null;
    return entry;
  } catch {
    return null;
  }
}

async function writeEntry(id: string, entry: ScriptEntry) {
  // SECURITY: Validate ID format
  if (!isValidScriptId(id)) {
    throw new Error('Invalid script ID format');
  }
  
  await ensureDir();
  const sanitizedId = sanitizeScriptId(id);
  const file = path.join(STORE_DIR, `${sanitizedId}.json`);
  await writeFile(file, JSON.stringify(entry), 'utf-8');
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Rate limiting check
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`script-share:post:${clientIP}`, RATE_LIMIT_POST_MAX, RATE_LIMIT_WINDOW_MS);
    
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

    const { script, os: osName, packages } = await request.json();
    
    // SECURITY: Validate script is a string and has reasonable length
    if (!script || typeof script !== 'string') {
      return NextResponse.json({ error: 'Invalid script' }, { status: 400 });
    }
    
    // SECURITY: Limit script size (max 1MB)
    if (script.length > 1024 * 1024) {
      return NextResponse.json({ error: 'Script too large (max 1MB)' }, { status: 400 });
    }
    
    // SECURITY: Validate packages is an array of strings
    if (packages !== undefined && (!Array.isArray(packages) || !packages.every(p => typeof p === 'string'))) {
      return NextResponse.json({ error: 'Invalid packages format' }, { status: 400 });
    }

    const id = generateId();
    await writeEntry(id, {
      script,
      createdAt: Date.now(),
      meta: { os: osName ?? 'unknown', packages: packages ?? [] },
    });

    return NextResponse.json({ id }, {
      headers: {
        'X-RateLimit-Limit': String(RATE_LIMIT_POST_MAX),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
      }
    });
  } catch (err) {
    console.error('script-share POST error:', err);
    return NextResponse.json({ error: 'Failed to store script' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // SECURITY: Rate limiting check
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(`script-share:get:${clientIP}`, RATE_LIMIT_GET_MAX, RATE_LIMIT_WINDOW_MS);
  
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

  const entry = await readEntry(id);
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