import { VersionRepository } from '@/domain/repositories/version-repository.interface';
import { FetchVersionsInput, FetchVersionsOutput } from '../dto/fetch-versions.dto';

export class FetchVersionsUseCase {
  constructor(private readonly versionRepository: VersionRepository) {}

  async execute(input: FetchVersionsInput): Promise<FetchVersionsOutput> {
    const entries = await Promise.all(
      input.packageIds.map(async (packageId) => [
        packageId,
        await this.versionRepository.fetchLatest(packageId),
      ] as const),
    );

    return { versions: Object.fromEntries(entries) };
  }
}
