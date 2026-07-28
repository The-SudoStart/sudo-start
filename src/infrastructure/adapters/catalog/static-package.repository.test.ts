import { describe, expect, it } from 'vitest';
import { StaticPackageRepository } from './static-package.repository';

describe('StaticPackageRepository', () => {
  it('finds packages by id, category, platform, and search query', async () => {
    const repository = new StaticPackageRepository();

    await expect(repository.findById('git')).resolves.toMatchObject({ id: 'git' });
    expect(repository.findByIdSync('git')?.id).toBe('git');
    expect(repository.findForPlatformSync('linux').every((pkg) => pkg.platforms.linux)).toBe(true);
    expect(repository.findByCategorySync('vcs').length).toBeGreaterThan(0);
    expect(repository.searchSync('git').length).toBeGreaterThan(0);
    expect(repository.getDefaultPackagesSync().length).toBeGreaterThan(0);
    expect(repository.isValidPackageId('git')).toBe(true);
  });
});
