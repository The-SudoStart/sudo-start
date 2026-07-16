import { RegistryAdapter, RegistrySearchResult } from './types';
import { Package, Category } from '@/types';

export class AptAdapter implements RegistryAdapter {
  id = 'apt' as const;

  async search(query: string, limit = 20): Promise<RegistrySearchResult[]> {
    try {
      const res = await fetch(`https://api.ubuntu.com/v1/search?q=${encodeURIComponent(query)}&section=all&field=name,summary,version,description`);
      if (!res.ok) throw new Error('Failed to search APT packages');

      const data = await res.json();

      return data.packages?.slice(0, limit).map((pkg: any) => ({
        name: pkg.name,
        description: pkg.summary || 'No description',
        version: pkg.version || 'latest',
        homepage: pkg.website,
        license: pkg.license,
      })) || [];
    } catch (error) {
      console.error('APT search error:', error);
      return [];
    }
  }

  toPackage(result: RegistrySearchResult, category: Category = 'tool'): Package {
    return {
      id: `apt-${result.name}`,
      name: result.name,
      description: result.description,
      category,
      platforms: { macos: false, linux: true },
      defaultVersion: result.version,
      versions: [
        {
          id: result.version,
          label: result.version,
          macCommand: '',
          linuxCommand: `sudo apt install ${result.name}`,
        },
      ],
      linuxInstallCmd: `sudo apt install ${result.name}`,
    };
  }
}
