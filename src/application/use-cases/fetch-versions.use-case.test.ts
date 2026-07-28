import { describe, expect, it, vi } from 'vitest';
import { FetchVersionsUseCase } from './fetch-versions.use-case';
import { VersionRepository } from '@/domain/repositories/version-repository.interface';

describe('FetchVersionsUseCase', () => {
  it('returns a version map for package ids', async () => {
    const repository: VersionRepository = {
      fetchLatest: vi.fn(async (packageId) => [`${packageId}-1.0.0`]),
      validateVersion: vi.fn(),
    };

    const result = await new FetchVersionsUseCase(repository).execute({
      packageIds: ['nodejs', 'go'],
    });

    expect(result.versions).toEqual({
      nodejs: ['nodejs-1.0.0'],
      go: ['go-1.0.0'],
    });
  });
});
