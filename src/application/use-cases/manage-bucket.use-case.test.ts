import { describe, expect, it, vi } from 'vitest';
import { ManageBucketUseCase } from './manage-bucket.use-case';
import { StoragePort } from '../ports/outgoing/storage.port';
import { Package } from '@/types';

const pkg: Package = {
  id: 'git',
  name: 'Git',
  description: 'Version control',
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

function createStorage(initial: Package[] = []): StoragePort<Package[]> & { saved: Package[][] } {
  const saved: Package[][] = [];
  let value = initial;
  return {
    saved,
    load: vi.fn(async () => value),
    save: vi.fn(async (next) => {
      saved.push(next);
      value = next;
    }),
    clear: vi.fn(async () => {
      value = [];
    }),
  };
}

describe('ManageBucketUseCase', () => {
  it('adds, removes, and clears packages through storage', async () => {
    const storage = createStorage();
    const useCase = new ManageBucketUseCase(storage);

    expect(await useCase.addPackage(pkg)).toHaveLength(1);
    expect(await useCase.removePackage('git')).toHaveLength(0);
    expect(await useCase.clear()).toHaveLength(0);
    expect(storage.saved).toHaveLength(3);
  });
});
