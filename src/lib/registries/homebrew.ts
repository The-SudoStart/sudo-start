import { RegistryAdapter, RegistrySearchResult } from './types';
import { Package, Category } from '@/types';

export class HomebrewAdapter implements RegistryAdapter {
  id = 'homebrew' as const;
  private baseUrl = 'https://formulae.brew.sh/api';

  async search(query: string, limit = 20): Promise<RegistrySearchResult[]> {
    try {
      const res = await fetch(`${this.baseUrl}/formula.json`);
      if (!res.ok) throw new Error('Failed to fetch Homebrew formulae');

      const formulae = await res.json();
      const q = query.toLowerCase();

      return formulae
        .filter((f: any) =>
          f.name.toLowerCase().includes(q) ||
          f.desc?.toLowerCase().includes(q)
        )
        .slice(0, limit)
        .map((f: any) => ({
          name: f.name,
          description: f.desc || 'No description',
          version: f.versions?.stable || 'latest',
          homepage: f.homepage,
          license: f.license,
        }));
    } catch (error) {
      console.error('Homebrew search error:', error);
      return [];
    }
  }

  toPackage(result: RegistrySearchResult, category: Category = 'tool'): Package {
    return {
      id: `brew-${result.name}`,
      name: result.name,
      description: result.description,
      category,
      platforms: { macos: true, linux: false },
      defaultVersion: result.version,
      versions: [
        {
          id: result.version,
          label: result.version,
          macCommand: `brew install ${result.name}`,
          linuxCommand: '',
        },
      ],
      macosInstallCmd: `brew install ${result.name}`,
    };
  }
}
