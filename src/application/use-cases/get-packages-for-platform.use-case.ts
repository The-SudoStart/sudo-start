import { Category, OS, Package } from '@/types';
import { PackageRepository } from '@/domain/repositories/package-repository.interface';

export interface GetPackagesForPlatformInput {
  platform: OS | null;
  category?: Category | 'all';
}

export interface GetPackagesForPlatformOutput {
  packages: Package[];
  categories: Array<Category | 'all'>;
  categoryCounts: Record<string, number>;
}

export class GetPackagesForPlatformUseCase {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(input: GetPackagesForPlatformInput): Promise<GetPackagesForPlatformOutput> {
    return this.executeSync(input);
  }

  executeSync(input: GetPackagesForPlatformInput): GetPackagesForPlatformOutput {
    const packages = this.findAll()
      .filter((pkg) => !input.platform || pkg.platforms[input.platform]);
    const filtered = input.category && input.category !== 'all'
      ? packages.filter((pkg) => pkg.category === input.category)
      : packages;
    const categories = ['all', ...Array.from(new Set(packages.map((pkg) => pkg.category)))] as Array<Category | 'all'>;
    const categoryCounts = packages.reduce<Record<string, number>>((counts, pkg) => {
      counts[pkg.category] = (counts[pkg.category] ?? 0) + 1;
      return counts;
    }, { all: packages.length });

    return { packages: filtered, categories, categoryCounts };
  }

  private findAll(): Package[] {
    const repository = this.packageRepository as PackageRepository & { findAllSync?: () => Package[] };
    if (!repository.findAllSync) {
      throw new Error('Package repository does not support synchronous catalog reads');
    }

    return repository.findAllSync();
  }
}
