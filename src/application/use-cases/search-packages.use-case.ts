import { OS, Package } from '@/types';
import { PackageRepository } from '@/domain/repositories/package-repository.interface';

const POPULAR_PACKAGE_IDS = ['git', 'vscode', 'nodejs', 'docker', 'python3', 'rust', 'cursor', 'zsh', 'go', 'bun', 'vim', 'firefox'];

export interface SearchPackagesInput {
  query: string;
  platform: OS | null;
  limit?: number;
}

export interface SearchPackagesOutput {
  packages: Package[];
  suggestions: Package[];
}

export class SearchPackagesUseCase {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(input: SearchPackagesInput): Promise<SearchPackagesOutput> {
    return this.executeSync(input);
  }

  executeSync(input: SearchPackagesInput): SearchPackagesOutput {
    const packages = this.findAllForPlatform(input.platform);
    const query = input.query.trim().toLowerCase();
    const limit = input.limit ?? 12;
    const results = query
      ? packages
          .filter((pkg) => (
            pkg.name.toLowerCase().includes(query)
            || pkg.description.toLowerCase().includes(query)
            || pkg.category.toLowerCase().includes(query)
            || pkg.id.toLowerCase().includes(query)
          ))
          .slice(0, limit)
      : [];
    const suggestions = query
      ? []
      : packages.filter((pkg) => POPULAR_PACKAGE_IDS.includes(pkg.id)).slice(0, 8);

    return { packages: results, suggestions };
  }

  getRegistryIdsForPlatform(platform: OS | null): string[] {
    const registries = ['npm', 'pypi'];
    if (platform === 'macos') registries.push('homebrew');
    if (platform === 'linux') registries.push('apt');
    return registries;
  }

  mergeExternalResults(localResults: Package[], externalResults: Package[]): Package[] {
    const seen = new Set(localResults.map((pkg) => pkg.name.toLowerCase()));
    return externalResults.filter((pkg) => {
      const name = pkg.name.toLowerCase();
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }

  private findAllForPlatform(platform: OS | null): Package[] {
    const repository = this.packageRepository as PackageRepository & { findForPlatformSync?: (platform: OS | null) => Package[] };
    if (!repository.findForPlatformSync) {
      throw new Error('Package repository does not support platform catalog reads');
    }

    return repository.findForPlatformSync(platform);
  }
}
