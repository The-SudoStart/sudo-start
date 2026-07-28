export interface VersionRepository {
  fetchLatest(packageId: string): Promise<string[]>;
  validateVersion(packageId: string, version: string): Promise<boolean>;
}
