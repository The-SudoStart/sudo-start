import { describe, expect, it, vi } from 'vitest';
import { SearchPackagesUseCase } from './search-packages.use-case';
import { Package } from '@/types';

const mockPackages: Package[] = [
  {
    id: 'git',
    name: 'Git',
    description: 'Version control system',
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
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [{ id: 'stable', label: 'Stable', macCommand: 'brew install --cask visual-studio-code', linuxCommand: 'sudo snap install code' }],
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    description: 'JavaScript runtime',
    category: 'runtimes',
    platforms: { macos: true, linux: true },
    defaultVersion: 'lts',
    versions: [{ id: 'lts', label: 'LTS', macCommand: 'brew install node', linuxCommand: 'sudo apt install nodejs' }],
  },
];

const createMockRepository = () => ({
  findById: vi.fn(),
  findByCategory: vi.fn(),
  search: vi.fn(),
  findForPlatformSync: vi.fn().mockReturnValue(mockPackages),
});

describe('SearchPackagesUseCase', () => {
  it('should return empty results for empty query', () => {
    const repository = createMockRepository();
    const useCase = new SearchPackagesUseCase(repository);

    const result = useCase.executeSync({ query: '', platform: 'macos' });

    expect(result.packages).toHaveLength(0);
    expect(result.suggestions).toHaveLength(3); // Returns popular packages
  });

  it('should search by name', () => {
    const repository = createMockRepository();
    const useCase = new SearchPackagesUseCase(repository);

    const result = useCase.executeSync({ query: 'git', platform: 'macos' });

    expect(result.packages).toHaveLength(1);
    expect(result.packages[0].id).toBe('git');
  });

  it('should search by description', () => {
    const repository = createMockRepository();
    const useCase = new SearchPackagesUseCase(repository);

    const result = useCase.executeSync({ query: 'editor', platform: 'macos' });

    expect(result.packages.length).toBeGreaterThan(0);
    expect(result.packages.some(p => p.id === 'vscode')).toBe(true);
  });

  it('should search by category', () => {
    const repository = createMockRepository();
    const useCase = new SearchPackagesUseCase(repository);

    const result = useCase.executeSync({ query: 'vcs', platform: 'macos' });

    expect(result.packages.length).toBeGreaterThan(0);
    expect(result.packages[0].category).toBe('vcs');
  });

  it('should search case-insensitively', () => {
    const repository = createMockRepository();
    const useCase = new SearchPackagesUseCase(repository);

    const result = useCase.executeSync({ query: 'GIT', platform: 'macos' });

    expect(result.packages).toHaveLength(1);
    expect(result.packages[0].id).toBe('git');
  });

  it('should respect limit parameter', () => {
    const repository = createMockRepository();
    const useCase = new SearchPackagesUseCase(repository);

    const result = useCase.executeSync({ query: 'e', platform: 'macos', limit: 2 });

    expect(result.packages).toHaveLength(2);
  });

  it('should return suggestions for empty query', () => {
    const repository = createMockRepository();
    const useCase = new SearchPackagesUseCase(repository);

    const result = useCase.executeSync({ query: '', platform: 'macos' });

    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it('should return empty suggestions when query provided', () => {
    const repository = createMockRepository();
    const useCase = new SearchPackagesUseCase(repository);

    const result = useCase.executeSync({ query: 'git', platform: 'macos' });

    expect(result.suggestions).toHaveLength(0);
  });

  it('should get registry ids for macos', () => {
    const repository = createMockRepository();
    const useCase = new SearchPackagesUseCase(repository);

    const registries = useCase.getRegistryIdsForPlatform('macos');

    expect(registries).toContain('npm');
    expect(registries).toContain('pypi');
    expect(registries).toContain('homebrew');
  });

  it('should get registry ids for linux', () => {
    const repository = createMockRepository();
    const useCase = new SearchPackagesUseCase(repository);

    const registries = useCase.getRegistryIdsForPlatform('linux');

    expect(registries).toContain('npm');
    expect(registries).toContain('pypi');
    expect(registries).toContain('apt');
  });

  it('should merge external results', () => {
    const repository = createMockRepository();
    const useCase = new SearchPackagesUseCase(repository);

    const localResults = [mockPackages[0]];
    const externalResults = [mockPackages[0], mockPackages[1]]; // git already in local

    const merged = useCase.mergeExternalResults(localResults, externalResults);

    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe('vscode');
  });

  it('should handle async execution', async () => {
    const repository = createMockRepository();
    const useCase = new SearchPackagesUseCase(repository);

    const result = await useCase.execute({ query: 'git', platform: 'macos' });

    expect(result.packages).toHaveLength(1);
  });
});
