import { StoragePort } from '@/application/ports/outgoing/storage.port';

export class LocalStorageAdapter<T> implements StoragePort<T> {
  constructor(private readonly key: string) {}

  async load(): Promise<T | null> {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(this.key);
    return raw ? JSON.parse(raw) as T : null;
  }

  async save(value: T): Promise<void> {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(this.key, JSON.stringify(value));
  }

  async clear(): Promise<void> {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(this.key);
  }
}
