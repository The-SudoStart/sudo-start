import { VersionRepository } from '@/domain/repositories/version-repository.interface';

export class BrowserVersionRepository implements VersionRepository {
  async fetchLatest(packageId: string): Promise<string[]> {
    const response = await fetch(`/api/versions?tool=${encodeURIComponent(packageId)}`);
    const data = await response.json();
    return Array.isArray(data.versions) ? data.versions : [];
  }

  async validateVersion(packageId: string, version: string): Promise<boolean> {
    return (await this.fetchLatest(packageId)).includes(version);
  }
}
