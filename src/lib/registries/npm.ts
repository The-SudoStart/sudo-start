import { RegistryAdapter, RegistrySearchResult } from './types';
import { Package, Category } from '@/types';

export class NpmAdapter implements RegistryAdapter {
  id = 'npm' as const;
  private baseUrl = 'https://registry.npmjs.org';

  async search(query: string, limit = 20): Promise<RegistrySearchResult[]> {
    try {
      const res = await fetch(`${this.baseUrl}/-/v1/search?text=${encodeURIComponent(query)}&size=${limit}`);
      if (!res.ok) throw new Error('Failed to search npm registry');

      const data = await res.json();

      return data.objects?.map((obj: any) => ({
        name: obj.package.name,
        description: obj.package.description || 'No description',
        version: obj.package.version,
        homepage: obj.package.links?.homepage,
        license: obj.package.license,
      })) || [];
    } catch (error) {
      console.error('npm search error:', error);
      return [];
    }
  }

  toPackage(result: RegistrySearchResult, category: Category = 'tool'): Package {
    return {
      id: `npm-${result.name}`,
      name: result.name,
      description: result.description,
      category,
      platforms: { macos: true, linux: true },
      defaultVersion: result.version,
      versions: [
        {
          id: result.version,
          label: result.version,
          macCommand: `npm install -g ${result.name}`,
          linuxCommand: `npm install -g ${result.name}`,
        },
      ],
      macosInstallCmd: `npm install -g ${result.name}`,
      linuxInstallCmd: `npm install -g ${result.name}`,
    };
  }
}
