import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { LocalStorageAdapter } from './local-storage.adapter';

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter<unknown>;
  let mockStorage: Record<string, string>;
  const TEST_KEY = 'test-storage-key';

  beforeEach(() => {
    mockStorage = {};

    // Mock localStorage
    Object.defineProperty(globalThis, 'window', {
      value: {
        localStorage: {
          getItem: vi.fn((key: string) => mockStorage[key] ?? null),
          setItem: vi.fn((key: string, value: string) => {
            mockStorage[key] = value;
          }),
          removeItem: vi.fn((key: string) => {
            delete mockStorage[key];
          }),
        },
      },
      writable: true,
    });

    adapter = new LocalStorageAdapter(TEST_KEY);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('load', () => {
    it('should return null when no data exists', async () => {
      const result = await adapter.load();
      expect(result).toBeNull();
    });

    it('should load and parse stored data', async () => {
      const testData = { name: 'Test', items: [1, 2, 3] };
      mockStorage[TEST_KEY] = JSON.stringify(testData);

      const result = await adapter.load();
      expect(result).toEqual(testData);
    });

    it('should return null on server-side (no window)', async () => {
      Object.defineProperty(globalThis, 'window', {
        value: undefined,
        writable: true,
      });

      const result = await adapter.load();
      expect(result).toBeNull();
    });

    it('should handle invalid JSON gracefully', async () => {
      mockStorage[TEST_KEY] = 'invalid json {';

      await expect(adapter.load()).rejects.toThrow();
    });
  });

  describe('save', () => {
    it('should serialize and store data', async () => {
      const testData = { id: 1, name: 'Test Package' };

      await adapter.save(testData);

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        TEST_KEY,
        JSON.stringify(testData)
      );
      expect(mockStorage[TEST_KEY]).toBe(JSON.stringify(testData));
    });

    it('should handle complex objects', async () => {
      const complexData = {
        nested: { value: 123 },
        array: [1, 'two', { three: 3 }],
      };

      await adapter.save(complexData);

      const stored = mockStorage[TEST_KEY];
      expect(stored).toBeDefined();
      expect(JSON.parse(stored)).toEqual(complexData);
    });

    it('should do nothing on server-side (no window)', async () => {
      Object.defineProperty(globalThis, 'window', {
        value: undefined,
        writable: true,
      });

      await adapter.save({ test: true });

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove stored data', async () => {
      mockStorage[TEST_KEY] = JSON.stringify({ data: 'test' });

      await adapter.clear();

      expect(window.localStorage.removeItem).toHaveBeenCalledWith(TEST_KEY);
      expect(mockStorage[TEST_KEY]).toBeUndefined();
    });

    it('should handle clearing non-existent key', async () => {
      await adapter.clear();

      expect(window.localStorage.removeItem).toHaveBeenCalledWith(TEST_KEY);
      // Should not throw
      expect(true).toBe(true);
    });

    it('should do nothing on server-side (no window)', async () => {
      Object.defineProperty(globalThis, 'window', {
        value: undefined,
        writable: true,
      });

      await adapter.clear();

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('end-to-end workflow', () => {
    it('should handle full save/load/clear cycle', async () => {
      const testData = { bucket: [{ id: 'git' }, { id: 'nodejs' }] };

      // Save
      await adapter.save(testData);
      expect(mockStorage[TEST_KEY]).toBeDefined();

      // Load
      const loaded = await adapter.load();
      expect(loaded).toEqual(testData);

      // Clear
      await adapter.clear();
      expect(mockStorage[TEST_KEY]).toBeUndefined();

      // Verify cleared
      const afterClear = await adapter.load();
      expect(afterClear).toBeNull();
    });
  });

  describe('isolation', () => {
    it('should isolate data between different keys', async () => {
      const adapter1 = new LocalStorageAdapter('key1');
      const adapter2 = new LocalStorageAdapter('key2');

      await adapter1.save({ value: 1 });
      await adapter2.save({ value: 2 });

      const result1 = await adapter1.load();
      const result2 = await adapter2.load();

      expect(result1).toEqual({ value: 1 });
      expect(result2).toEqual({ value: 2 });
    });
  });
});
