import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/config/di-container';
import { VERSION_SOURCES } from '@/infrastructure/adapters/registries/http-version.repository';
import { checkRateLimit } from '@/lib/security';

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0]?.trim() || realIP || 'unknown';
}

export async function GET(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(`versions:${clientIP}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
        },
      },
    );
  }

  const { searchParams } = new URL(request.url);
  const tool = searchParams.get('tool');

  if (!tool) {
    return NextResponse.json({ error: 'Missing "tool" query parameter' }, { status: 400 });
  }

  if (!VERSION_SOURCES[tool.toLowerCase()]) {
    return NextResponse.json(
      { error: `Unsupported tool: ${tool}. Supported: ${Object.keys(VERSION_SOURCES).join(', ')}` },
      { status: 400 },
    );
  }

  const cachedBeforeFetch = container.versionRepository.getCached(tool);

  try {
    const { versions } = await container.fetchVersionsUseCase.execute({ packageIds: [tool] });

    return NextResponse.json({
      versions: versions[tool],
      cached: Boolean(cachedBeforeFetch),
      tool,
    }, {
      headers: {
        'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
      },
    });
  } catch (error) {
    console.error(`Error fetching versions for ${tool}:`, error);

    const cached = container.versionRepository.getCached(tool);
    if (cached) {
      return NextResponse.json({
        versions: cached,
        cached: true,
        stale: true,
        tool,
      }, {
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
        },
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch versions', tool },
      {
        status: 500,
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetTime / 1000)),
        },
      },
    );
  }
}
