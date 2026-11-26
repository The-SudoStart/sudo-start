import { NextRequest, NextResponse } from 'next/server';
import { registryAdapters, RegistryType } from '@/lib/registries';
import { enforceRateLimit, getClientIP, isValidVersion } from '@/lib/security';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const registry = searchParams.get('registry') as RegistryType;
  const limit = Number(searchParams.get('limit') || '20');

  if (!query || query.length > 100) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  if (!registry) {
    return NextResponse.json({ error: 'Registry parameter is required' }, { status: 400 });
  }

  const adapter = registryAdapters[registry];
  if (!adapter) {
    return NextResponse.json({ error: `Unknown registry: ${registry}` }, { status: 400 });
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
    return NextResponse.json({ error: 'Limit must be an integer from 1 to 20' }, { status: 400 });
  }

  try {
    const rateLimit = await enforceRateLimit(`registry:${getClientIP(request)}`, 30, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    const results = await adapter.search(query, limit);
    const packages = results
      .filter((r) => r.name.length <= 120 &&
        /^(?:@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._+~-]*$/i.test(r.name) &&
        isValidVersion(r.version))
      .map((r) => adapter.toPackage(r));
    return NextResponse.json({ packages, count: packages.length });
  } catch (error) {
    console.error(`Registry search error (${registry}):`, error);
    return NextResponse.json({ error: 'Search failed', packages: [], count: 0 }, {
      status: error instanceof Error && error.message.includes('Shared Redis') ? 503 : 500,
    });
  }
}
