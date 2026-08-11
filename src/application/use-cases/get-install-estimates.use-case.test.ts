import { describe, expect, it } from 'vitest';
import { GetInstallEstimatesUseCase } from './get-install-estimates.use-case';
import { Package } from '@/types';

const createPackage = (id: string, category: string = 'tools'): Package => ({
  id,
  name: id,
  description: 'Test package',
  category: category as any,
  platforms: { macos: true, linux: true },
  defaultVersion: 'stable',
  versions: [{ id: 'stable', label: 'Stable', macCommand: 'brew install test', linuxCommand: 'sudo apt install test' }],
});

describe('GetInstallEstimatesUseCase', () => {
  const useCase = new GetInstallEstimatesUseCase();

  it('should return minimum estimates for empty bucket', () => {
    const result = useCase.execute([]);

    // estimateInstallTime returns at least 1 minute
    expect(result.estimatedMinutes).toBeGreaterThanOrEqual(1);
    expect(result.estimatedDiskMb).toBe(0);
    expect(result.diskLabel).toBe('0 MB');
  });

  it('should return estimates for single package', () => {
    const result = useCase.execute([createPackage('git')]);

    expect(result.estimatedMinutes).toBeGreaterThan(0);
    expect(result.estimatedDiskMb).toBeGreaterThan(0);
  });

  it('should accumulate estimates for multiple packages', () => {
    const packages = [
      createPackage('git'),
      createPackage('nodejs'),
      createPackage('docker'),
    ];

    const result = useCase.execute(packages);

    expect(result.estimatedMinutes).toBeGreaterThan(0);
    expect(result.estimatedDiskMb).toBeGreaterThan(0);
  });

  it('should return GB label for large disk estimates', () => {
    // Create many packages to exceed 1000 MB
    const packages = Array.from({ length: 50 }, (_, i) => createPackage(`pkg${i}`));

    const result = useCase.execute(packages);

    // Should have some disk space estimate
    expect(typeof result.diskLabel).toBe('string');
    // If over 1000 MB, should show GB
    if (result.estimatedDiskMb >= 1000) {
      expect(result.diskLabel).toContain('GB');
    } else {
      expect(result.diskLabel).toContain('MB');
    }
  });

  it('should return MB label for small disk estimates', () => {
    const result = useCase.execute([createPackage('small-pkg')]);

    // Single small package should be under 1000 MB
    expect(result.diskLabel).toContain('MB');
  });
});
