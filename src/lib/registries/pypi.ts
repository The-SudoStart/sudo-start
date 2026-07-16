import { RegistryAdapter, RegistrySearchResult } from './types';
import { Package, Category } from '@/types';

export class PyPIAdapter implements RegistryAdapter {
  id = 'pypi' as const;
  private baseUrl = 'https://pypi.org/pypi';

  async search(query: string, limit = 20): Promise<RegistrySearchResult[]> {
    try {
      const res = await fetch(`${this.baseUrl}/search/?q=${encodeURIComponent(query)}&o=`);
      if (!res.ok) throw new Error('Failed to search PyPI');

      const data = await res.json();

      return data.results?.slice(0, limit).map((pkg: { name: string; summary?: string; version: string; project_url?: string; license?: string }) => ({
        name: pkg.name,
        description: pkg.summary || 'No description',
        version: pkg.version,
        homepage: pkg.project_url,
        license: pkg.license,
      })) || [];
    } catch (error) {
      console.error('PyPI search error:', error);
      return [];
    }
  }

  toPackage(result: RegistrySearchResult, category: Category = 'tool'): Package {
    return {
      id: `pypi-${result.name}`,
      name: result.name,
      description: result.description,
      category,
      platforms: { macos: true, linux: true },
      defaultVersion: result.version,
      versions: [
        {
          id: result.version,
          label: result.version,
          macCommand: `pip install ${result.name}`,
          linuxCommand: `pip install ${result.name}`,
        },
      ],
      macosInstallCmd: `pip install ${result.name}`,
      linuxInstallCmd: `pip install ${result.name}`,
    };
  }
}
