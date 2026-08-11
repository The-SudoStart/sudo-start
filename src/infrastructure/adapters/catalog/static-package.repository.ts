import { Category, OS, Package } from '@/types';
import { PackageRepository } from '@/domain/repositories/package-repository.interface';
import { PackageEntity } from '@/domain/entities/package';
import { appCatalog } from '@/lib/apps';

export class StaticPackageRepository implements PackageRepository {
  async findById(id: string): Promise<PackageEntity | null> {
    return this.findByIdSync(id);
  }

  findByIdSync(id: string): PackageEntity | null {
    const pkg = appCatalog.find((candidate) => candidate.id === id);
    return pkg ? PackageEntity.fromDTO(pkg) : null;
  }

  async findByCategory(category: Category): Promise<PackageEntity[]> {
    return this.findByCategorySync(category);
  }

  findByCategorySync(category: Category): PackageEntity[] {
    return appCatalog
      .filter((pkg) => pkg.category === category)
      .map((pkg) => PackageEntity.fromDTO(pkg));
  }

  async search(query: string): Promise<PackageEntity[]> {
    return this.searchSync(query);
  }

  searchSync(query: string): PackageEntity[] {
    const normalized = query.trim().toLowerCase();
    return this.findAllSync()
      .filter((pkg) => (
        pkg.id.toLowerCase().includes(normalized)
        || pkg.name.toLowerCase().includes(normalized)
        || pkg.description.toLowerCase().includes(normalized)
      ))
      .map((pkg) => PackageEntity.fromDTO(pkg));
  }

  findAllSync(): Package[] {
    return [...appCatalog];
  }

  findForPlatformSync(os: OS | null): Package[] {
    if (!os) return this.findAllSync();
    return appCatalog.filter((pkg) => pkg.platforms[os]);
  }

  getDefaultPackagesSync(): Package[] {
    const defaultAppIds = [
      'vscode',
      'cursor',
      'google-chrome',
      'git',
      'curl',
      'wget',
      'nvm',
      'nodejs',
      'npm',
      'python3',
      'docker',
      'postgresql',
      'zsh',
      'oh-my-zsh',
      'jq',
      'htop',
    ];

    return appCatalog.filter((pkg) => defaultAppIds.includes(pkg.id));
  }

  isValidPackageId(id: string): boolean {
    return appCatalog.some((pkg) => pkg.id === id);
  }
}

export const staticPackageRepository = new StaticPackageRepository();
