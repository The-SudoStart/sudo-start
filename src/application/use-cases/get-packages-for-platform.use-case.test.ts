import { describe, expect, it, vi } from 'vitest';
import { GetPackagesForPlatformUseCase } from './get-packages-for-platform.use-case';
import { Package } from '@/types';

const mockPackages: Package[] = [
  {
    id: 'git',
    name: 'Git',
    description: 'Version control',
    category: 'vcs',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [{ id: 'stable', label: 'Stable', macCommand: 'brew install git', linuxCommand: 'sudo apt install git' }],
  },
  {
    id: 'vscode',
    name: 'VS Code',
    description: 'Code editor',
    category: 'ides',
    platforms: { macos: true, linux: false },
    defaultVersion: 'stable',
    versions: [{ id: 'stable', label: 'Stable', macCommand: 'brew install --cask visual-studio-code', linuxCommand: '' }],
  },
  {
    id: 'apt-package',
    name: 'Apt Package',
    description: 'Linux only',
    category: 'tools',
    platforms: { macos: false, linux: true },
    defaultVersion: 'stable',
    versions: [{ id: 'stable', label: 'Stable', macCommand: '', linuxCommand: 'sudo apt install apt-package' }],
  },
];

const createMockRepository = () => ({
  findById: vi.fn(),
  findByCategory: vi.fn(),
  search: vi.fn(),
  findAllSync: vi.fn().mockReturnValue(mockPackages),
});

describe('GetPackagesForPlatformUseCase', () => {
  it('should return all packages for null platform', () => {
    const repository = createMockRepository();
    const useCase = new GetPackagesForPlatformUseCase(repository);

    const result = useCase.executeSync({ platform: null });

    expect(result.packages).toHaveLength(3);
    expect(result.categories).toContain('all');
  });

  it('should filter packages by macos platform', () => {
    const repository = createMockRepository();
    const useCase = new GetPackagesForPlatformUseCase(repository);

    const result = useCase.executeSync({ platform: 'macos' });

    expect(result.packages).toHaveLength(2);
    expect(result.packages.some(p => p.id === 'git')).toBe(true);
    expect(result.packages.some(p => p.id === 'vscode')).toBe(true);
    expect(result.packages.some(p => p.id === 'apt-package')).toBe(false);
  });

  it('should filter packages by linux platform', () => {
    const repository = createMockRepository();
    const useCase = new GetPackagesForPlatformUseCase(repository);

    const result = useCase.executeSync({ platform: 'linux' });

    expect(result.packages).toHaveLength(2);
    expect(result.packages.some(p => p.id === 'git')).toBe(true);
    expect(result.packages.some(p => p.id === 'apt-package')).toBe(true);
    expect(result.packages.some(p => p.id === 'vscode')).toBe(false);
  });

  it('should filter by category', () => {
    const repository = createMockRepository();
    const useCase = new GetPackagesForPlatformUseCase(repository);

    const result = useCase.executeSync({ platform: 'macos', category: 'vcs' });

    expect(result.packages).toHaveLength(1);
    expect(result.packages[0].category).toBe('vcs');
  });

  it('should return all categories', () => {
    const repository = createMockRepository();
    const useCase = new GetPackagesForPlatformUseCase(repository);

    const result = useCase.executeSync({ platform: 'macos' });

    expect(result.categories).toContain('all');
    expect(result.categories).toContain('vcs');
    expect(result.categories).toContain('ides');
    // 'tools' category package is linux only, so not included in macos results
  });

  it('should calculate category counts', () => {
    const repository = createMockRepository();
    const useCase = new GetPackagesForPlatformUseCase(repository);

    const result = useCase.executeSync({ platform: 'macos' });

    expect(result.categoryCounts['all']).toBe(2);
    expect(result.categoryCounts['vcs']).toBe(1);
    expect(result.categoryCounts['ides']).toBe(1);
  });

  it('should handle async execution', async () => {
    const repository = createMockRepository();
    const useCase = new GetPackagesForPlatformUseCase(repository);

    const result = await useCase.execute({ platform: 'macos' });

    expect(result.packages).toHaveLength(2);
  });

  it('should throw when repository does not support sync reads', () => {
    const repository = {
      findById: vi.fn(),
      findByCategory: vi.fn(),
      search: vi.fn(),
      // findAllSync missing
    };
    const useCase = new GetPackagesForPlatformUseCase(repository as any);

    expect(() => useCase.executeSync({ platform: 'macos' })).toThrow('Package repository does not support synchronous catalog reads');
  });
});
