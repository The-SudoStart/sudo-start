import { describe, expect, it, beforeEach } from 'vitest';
import { GenerateScriptUseCase } from '@/application/use-cases/generate-script.use-case';
import { ManageBucketUseCase } from '@/application/use-cases/manage-bucket.use-case';
import { StaticPackageRepository } from '@/infrastructure/adapters/catalog/static-package.repository';
import { Package } from '@/types';

const testPackage: Package = {
  id: 'git',
  name: 'Git',
  description: 'Version control system',
  category: 'vcs',
  platforms: { macos: true, linux: true },
  defaultVersion: 'stable',
  versions: [
    {
      id: 'stable',
      label: 'Stable',
      macCommand: 'brew install git',
      linuxCommand: 'sudo apt-get install -y git',
    },
  ],
};

const nodePackage: Package = {
  id: 'nodejs',
  name: 'Node.js',
  description: 'JavaScript runtime',
  category: 'runtimes',
  platforms: { macos: true, linux: true },
  defaultVersion: 'lts',
  versions: [
    {
      id: 'lts',
      label: 'LTS',
      macCommand: 'brew install node',
      linuxCommand: 'sudo apt-get install -y nodejs',
    },
  ],
};

describe('Script Generation Flow', () => {
  let packageRepository: StaticPackageRepository;
  let manageBucketUseCase: ManageBucketUseCase;
  let generateScriptUseCase: GenerateScriptUseCase;

  beforeEach(() => {
    packageRepository = new StaticPackageRepository();
    manageBucketUseCase = new ManageBucketUseCase(
      { load: async () => null, save: async () => {}, clear: async () => {} } as any,
      packageRepository
    );
    generateScriptUseCase = new GenerateScriptUseCase();
  });

  it('should generate script for packages in bucket', async () => {
    // Add packages to bucket
    const bucket = manageBucketUseCase.addPackageToBucket([], testPackage);
    const bucketWithNode = manageBucketUseCase.addPackageToBucket(bucket, nodePackage);

    expect(bucketWithNode).toHaveLength(2);

    // Generate script
    const result = await generateScriptUseCase.execute({
      platform: 'linux',
      shell: 'bash',
      packages: bucketWithNode,
    });

    expect(result.script).toContain('#!/bin/bash');
    expect(result.script).toContain('sudo apt-get install -y git');
    expect(result.script).toContain('sudo apt-get install -y nodejs');
    expect(result.script).toContain('SudoStart');
  });

  it('should generate macOS script with brew commands', async () => {
    const bucket = manageBucketUseCase.addPackageToBucket([], testPackage);

    const result = await generateScriptUseCase.execute({
      platform: 'macos',
      shell: 'zsh',
      packages: bucket,
    });

    expect(result.script).toContain('#!/bin/bash');
    expect(result.script).toContain('brew install git');
    expect(result.script).toContain('OS: MACOS');
    expect(result.script).toContain('Shell: zsh');
  });

  it('should handle empty bucket gracefully', async () => {
    const result = await generateScriptUseCase.execute({
      platform: 'linux',
      shell: 'bash',
      packages: [],
    });

    expect(result.script).toContain('#!/bin/bash');
    expect(result.script).not.toContain('apt-get install');
    expect(result.script).not.toContain('brew install');
  });

  it('should support version pinning in script generation', async () => {
    const packageWithVersion = { ...testPackage, selectedVersion: 'stable' };
    const bucket = manageBucketUseCase.addPackageToBucket([], packageWithVersion);

    const result = await generateScriptUseCase.execute({
      platform: 'linux',
      shell: 'bash',
      packages: bucket,
    });

    expect(result.script).toContain('sudo apt-get install -y git');
  });
});

describe('Full Application Flow', () => {
  it('should handle complete workflow: search -> add to bucket -> generate script', async () => {
    const packageRepository = new StaticPackageRepository();
    const manageBucketUseCase = new ManageBucketUseCase(
      { load: async () => null, save: async () => {}, clear: async () => {} } as any,
      packageRepository
    );
    const generateScriptUseCase = new GenerateScriptUseCase();

    // Search for packages
    const searchResults = await packageRepository.search('git');
    expect(searchResults.length).toBeGreaterThan(0);

    // Add found package to bucket
    const gitPackage = searchResults.find(p => p.id === 'git');
    expect(gitPackage).toBeDefined();

    if (gitPackage) {
      const bucket = manageBucketUseCase.addPackageToBucket([], gitPackage.toDTO());
      expect(bucket).toHaveLength(1);
      expect(bucket[0].id).toBe('git');

      // Generate script
      const result = await generateScriptUseCase.execute({
        platform: 'linux',
        shell: 'bash',
        packages: bucket,
      });

      expect(result.script).toContain('git');
    }
  });
});
