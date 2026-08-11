import { afterEach, describe, expect, it, vi } from 'vitest';
import { BrowserVersionRepository } from './browser-version.repository';

describe('BrowserVersionRepository', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches and validates versions through the versions API', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      json: async () => ({ versions: ['1.0.0'] }),
    })));

    const repository = new BrowserVersionRepository();

    await expect(repository.fetchLatest('nodejs')).resolves.toEqual(['1.0.0']);
    await expect(repository.validateVersion('nodejs', '1.0.0')).resolves.toBe(true);
  });
});
