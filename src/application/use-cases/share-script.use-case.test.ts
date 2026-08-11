import { describe, expect, it, vi } from 'vitest';
import { ShareScriptUseCase } from './share-script.use-case';
import { ScriptSharePort } from '../ports/outgoing/script-share.port';

describe('ShareScriptUseCase', () => {
  it('stores a script and returns its id', async () => {
    const port: ScriptSharePort = {
      create: vi.fn(async () => 'abc123def4'),
      findById: vi.fn(),
    };

    await expect(new ShareScriptUseCase(port).execute({
      script: '#!/bin/bash',
      os: 'linux',
      packages: ['Git'],
    })).resolves.toEqual({ id: 'abc123def4' });
  });

  it('rejects invalid scripts', async () => {
    const port: ScriptSharePort = {
      create: vi.fn(),
      findById: vi.fn(),
    };

    await expect(new ShareScriptUseCase(port).execute({ script: '' })).rejects.toThrow('Invalid script');
  });
});
