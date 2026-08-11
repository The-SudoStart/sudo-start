import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { GroqAdapter } from './groq.adapter';

// Mock security module to validate keys
let mockIsValidGroqApiKey = vi.fn().mockReturnValue(true);

vi.mock('@/lib/security', () => ({
  isValidGroqApiKey: (...args: any[]) => mockIsValidGroqApiKey(...args),
}));

describe('GroqAdapter', () => {
  let adapter: GroqAdapter;
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    mockIsValidGroqApiKey.mockReturnValue(true);
    process.env = { ...originalEnv, GROQ_API_KEY: 'gsk_test1234567890abcdef' };
    adapter = new GroqAdapter();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('should be instantiable', () => {
    expect(adapter).toBeInstanceOf(GroqAdapter);
  });

  it('should implement AIProvider interface', () => {
    expect(typeof adapter.streamChat).toBe('function');
  });

  it('should throw when API key is missing', async () => {
    delete process.env.GROQ_API_KEY;
    // Need to create new instance after env change
    const adapterWithoutKey = new GroqAdapter();
    
    await expect(
      adapterWithoutKey.streamChat([], [])
    ).rejects.toThrow('GROQ_API_KEY');
  });

  it('should throw for invalid API key format', async () => {
    mockIsValidGroqApiKey.mockReturnValue(false);
    process.env.GROQ_API_KEY = 'invalid-key';
    const adapterWithInvalidKey = new GroqAdapter();
    
    await expect(
      adapterWithInvalidKey.streamChat([], [])
    ).rejects.toThrow('Invalid GROQ_API_KEY format');
  });
});

// Integration-style tests that verify the adapter behavior
describe('GroqAdapter Integration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    mockIsValidGroqApiKey.mockReturnValue(true);
    process.env = { ...originalEnv, GROQ_API_KEY: 'gsk_test1234567890abcdef' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should have correct configuration', () => {
    const adapter = new GroqAdapter();
    expect(adapter).toBeDefined();
    expect(typeof adapter.streamChat).toBe('function');
  });
});
