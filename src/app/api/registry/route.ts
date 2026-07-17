import { NextRequest, NextResponse } from 'next/server';
import { registryAdapters, RegistryType } from '@/lib/registries';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const registry = searchParams.get('registry') as RegistryType;
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  if (!registry) {
    return NextResponse.json({ error: 'Registry parameter is required' }, { status: 400 });
  }

  const adapter = registryAdapters[registry];
  if (!adapter) {
    return NextResponse.json({ error: `Unknown registry: ${registry}` }, { status: 400 });
  }

  try {
    const results = await adapter.search(query, limit);
    const packages = results.map((r) => adapter.toPackage(r));
    return NextResponse.json({ packages, count: packages.length });
  } catch (error) {
    console.error(`Registry search error (${registry}):`, error);
    return NextResponse.json({ error: 'Search failed', packages: [], count: 0 }, { status: 500 });
  }
}
