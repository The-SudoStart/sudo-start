import { describe, expect, it, vi } from 'vitest';
import { ShareScriptUseCase } from './share-script.use-case';

const createMockScriptShare = () => ({
  create: vi.fn().mockResolvedValue('test-share-id'),
  findById: vi.fn(),
});

describe('ShareScriptUseCase', () => {
  it('should share a script and return id', async () => {
    const scriptShare = createMockScriptShare();
    const useCase = new ShareScriptUseCase(scriptShare);

    const result = await useCase.execute({
      script: '#!/bin/bash\necho hello',
      os: 'macos',
      packages: ['git', 'nodejs'],
    });

    expect(result.id).toBe('test-share-id');
    expect(scriptShare.create).toHaveBeenCalledWith({
      script: '#!/bin/bash\necho hello',
      meta: {
        os: 'macos',
        packages: ['git', 'nodejs'],
      },
    });
  });

  it('should handle null os', async () => {
    const scriptShare = createMockScriptShare();
    const useCase = new ShareScriptUseCase(scriptShare);

    const result = await useCase.execute({
      script: '#!/bin/bash',
      packages: [],
    });

    expect(result.id).toBe('test-share-id');
    expect(scriptShare.create).toHaveBeenCalledWith(expect.objectContaining({
      meta: expect.objectContaining({
        os: 'unknown',
      }),
    }));
  });

  it('should handle null packages', async () => {
    const scriptShare = createMockScriptShare();
    const useCase = new ShareScriptUseCase(scriptShare);

    const result = await useCase.execute({
      script: '#!/bin/bash',
      os: 'linux',
    });

    expect(result.id).toBe('test-share-id');
    expect(scriptShare.create).toHaveBeenCalledWith(expect.objectContaining({
      meta: expect.objectContaining({
        packages: [],
      }),
    }));
  });

  it('should throw for invalid script', async () => {
    const scriptShare = createMockScriptShare();
    const useCase = new ShareScriptUseCase(scriptShare);

    await expect(useCase.execute({
      script: '',
    })).rejects.toThrow('Invalid script');

    await expect(useCase.execute({
      script: 123 as any,
    })).rejects.toThrow('Invalid script');
  });

  it('should throw for script too large', async () => {
    const scriptShare = createMockScriptShare();
    const useCase = new ShareScriptUseCase(scriptShare);

    const largeScript = 'x'.repeat(1024 * 1024 + 1);

    await expect(useCase.execute({
      script: largeScript,
    })).rejects.toThrow('Script too large');
  });

  it('should allow script at exactly 1MB limit', async () => {
    const scriptShare = createMockScriptShare();
    const useCase = new ShareScriptUseCase(scriptShare);

    const scriptAtLimit = 'x'.repeat(1024 * 1024);

    await expect(useCase.execute({
      script: scriptAtLimit,
    })).resolves.toEqual({ id: 'test-share-id' });
  });
});
