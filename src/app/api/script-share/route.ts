import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/config/di-container';
import { checkRateLimit, isValidScriptId } from '@/lib/security';

const TTL_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_POST_MAX = 20;
const RATE_LIMIT_GET_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIP || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`script-share:post:${clientIP}`, RATE_LIMIT_POST_MAX, RATE_LIMIT_WINDOW_MS);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(RATE_LIMIT_POST_MAX),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
          },
        },
      );
    }

    const { script, os, packages } = await request.json();
    if (packages !== undefined && (!Array.isArray(packages) || !packages.every((pkg) => typeof pkg === 'string'))) {
      return NextResponse.json({ error: 'Invalid packages format' }, { status: 400 });
    }

    const { id } = await container.shareScriptUseCase.execute({ script, os, packages });

    return NextResponse.json({ id }, {
      headers: {
        'X-RateLimit-Limit': String(RATE_LIMIT_POST_MAX),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to store script';
    const status = message.startsWith('Invalid') || message.startsWith('Script too large') ? 400 : 500;
    console.error('script-share POST error:', error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(`script-share:get:${clientIP}`, RATE_LIMIT_GET_MAX, RATE_LIMIT_WINDOW_MS);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT_GET_MAX),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
        },
      },
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  if (!isValidScriptId(id)) {
    return NextResponse.json({ error: 'Invalid id format' }, { status: 400 });
  }

  const entry = await container.scriptShareAdapter.findById(id);
  if (!entry) {
    const ua = request.headers.get('user-agent') ?? '';
    const isCli = ua.toLowerCase().includes('curl') || ua.toLowerCase().includes('wget');
    if (isCli) {
      return new NextResponse(
        '#!/bin/bash\necho "Error: Script not found or expired (24h TTL)"\nexit 1\n',
        {
          status: 404,
          headers: {
            'Content-Type': 'text/plain',
            'X-RateLimit-Limit': String(RATE_LIMIT_GET_MAX),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
          },
        },
      );
    }

    return NextResponse.json({ error: 'Script not found or expired' }, {
      status: 404,
      headers: {
        'X-RateLimit-Limit': String(RATE_LIMIT_GET_MAX),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
      },
    });
  }

  const ua = request.headers.get('user-agent') ?? '';
  const raw = searchParams.get('raw') === '1';
  const isCli = ua.toLowerCase().includes('curl') || ua.toLowerCase().includes('wget') || raw;

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
    },
  });
}
