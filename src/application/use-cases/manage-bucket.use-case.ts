import { Bucket } from '@/domain/entities/bucket';
import { PackageEntity } from '@/domain/entities/package';
import { PackageRepository } from '@/domain/repositories/package-repository.interface';
import { Package } from '@/types';
import { ManageBucketPort } from '../ports/incoming/manage-bucket.port';
import { StoragePort } from '../ports/outgoing/storage.port';

export class ManageBucketUseCase implements ManageBucketPort {
  constructor(
    private readonly storage?: StoragePort<Package[]>,
    private readonly packageRepository?: PackageRepository,
  ) {}

  async addPackage(pkg: Package): Promise<Package[]> {
    const storage = this.getStorage();
    const bucket = await this.loadBucket();
    return this.persist(bucket.add(PackageEntity.fromDTO(pkg)), storage);
  }

  async removePackage(packageId: string): Promise<Package[]> {
    const storage = this.getStorage();
    const bucket = await this.loadBucket();
    return this.persist(bucket.remove(packageId), storage);
  }

  async clear(): Promise<Package[]> {
    const storage = this.getStorage();
    const bucket = await this.loadBucket();
    return this.persist(bucket.clear(), storage);
  }

  async getContents(): Promise<Package[]> {
    return (await this.loadBucket()).getItems().map((pkg) => pkg.toDTO());
  }

  addPackageToBucket(current: Package[], pkg: Package): Package[] {
    return this.toPackages(this.createBucket(current).add(PackageEntity.fromDTO(pkg)));
  }

  addPackagesToBucket(current: Package[], packages: Package[]): Package[] {
    return packages.reduce(
      (bucket, pkg) => this.addPackageToBucket(bucket, {
        ...pkg,
        selectedVersion: pkg.selectedVersion ?? pkg.defaultVersion,
      }),
      current,
    );
  }

  removePackageFromBucket(current: Package[], packageId: string): Package[] {
    return this.toPackages(this.createBucket(current).remove(packageId));
  }

  clearBucket(current: Package[]): Package[] {
    return this.toPackages(this.createBucket(current).clear());
  }

  updatePackageVersion(current: Package[], packageId: string, version: string): Package[] {
    return current.map((pkg) => (
      pkg.id === packageId ? { ...pkg, selectedVersion: version } : pkg
    ));
  }

  updatePackageNote(current: Package[], packageId: string, note: string): Package[] {
    return current.map((pkg) => (
      pkg.id === packageId ? { ...pkg, versionNote: note } : pkg
    ));
  }

  getDefaultPackages(): Package[] {
    const repository = this.getSyncRepository();
    return repository.getDefaultPackagesSync();
  }

  getPackagesByIds(packageIds: string[]): Package[] {
    const repository = this.getSyncRepository();
    return packageIds
      .map((id) => repository.findByIdSync(id)?.toDTO())
      .filter((pkg): pkg is Package => Boolean(pkg));
  }

  importBucketEntries(entries: Array<{ id: string; selectedVersion?: string; versionNote?: string }>): Package[] {
    return entries.flatMap(({ id, selectedVersion, versionNote }) => {
      const pkg = this.getSyncRepository().findByIdSync(id)?.toDTO();
      if (!pkg) return [];
      return [{
        ...pkg,
        selectedVersion: selectedVersion || pkg.defaultVersion,
        versionNote: versionNote || '',
      }];
    });
  }

  private async loadBucket(): Promise<Bucket> {
    const stored = await this.getStorage().load();
    return new Bucket((stored ?? []).map((pkg) => PackageEntity.fromDTO(pkg)));
  }

  private async persist(bucket: Bucket, storage: StoragePort<Package[]>): Promise<Package[]> {
    const packages = this.toPackages(bucket);
    await storage.save(packages);
    return packages;
  }

  private createBucket(packages: Package[]): Bucket {
    return new Bucket(packages.map((pkg) => PackageEntity.fromDTO(pkg)));
  }

  private toPackages(bucket: Bucket): Package[] {
    return bucket.getItems().map((pkg) => pkg.toDTO());
  }

  private getStorage(): StoragePort<Package[]> {
    if (!this.storage) {
      throw new Error('ManageBucketUseCase requires a storage port for async persistence operations');
    }

    return this.storage;
  }

  private getSyncRepository(): PackageRepository & {
    findByIdSync: (id: string) => PackageEntity | null;
    getDefaultPackagesSync: () => Package[];
  } {
    if (!this.packageRepository) {
      throw new Error('ManageBucketUseCase requires a package repository for catalog operations');
    }

    return this.packageRepository as PackageRepository & {
      findByIdSync: (id: string) => PackageEntity | null;
      getDefaultPackagesSync: () => Package[];
    };
  }
}
