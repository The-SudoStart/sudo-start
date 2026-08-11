import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';
import { ScriptSharePort, ScriptShareRecord } from '@/application/ports/outgoing/script-share.port';
import { isValidScriptId, sanitizeScriptId } from '@/lib/security';

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 10; i += 1) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export class FileScriptShareAdapter implements ScriptSharePort {
  constructor(
    private readonly storeDir = process.env.SUDOSTART_STORE_DIR
      || path.join(os.tmpdir(), 'sudostart-scripts'),
    private readonly ttlMs = DEFAULT_TTL_MS,
  ) {}

  async create(entry: Omit<ScriptShareRecord, 'createdAt'>): Promise<string> {
    const id = generateId();
    await this.writeEntry(id, { ...entry, createdAt: Date.now() });
    return id;
  }

  async findById(id: string): Promise<ScriptShareRecord | null> {
    try {
      if (!isValidScriptId(id)) {
        console.warn(`[Security] Invalid script ID attempted: ${sanitizeScriptId(id)}`);
        return null;
      }

      const raw = await readFile(this.getSafeFilePath(id), 'utf-8');
      const entry = JSON.parse(raw) as ScriptShareRecord;
      if (Date.now() - entry.createdAt > this.ttlMs) return null;
      return entry;
    } catch {
      return null;
    }
  }

  private async writeEntry(id: string, entry: ScriptShareRecord): Promise<void> {
    if (!isValidScriptId(id)) {
      throw new Error('Invalid script ID format');
    }

    await this.ensureDir();
    await writeFile(this.getSafeFilePath(id), JSON.stringify(entry), 'utf-8');
  }

  private async ensureDir(): Promise<void> {
    if (!existsSync(this.storeDir)) {
      await mkdir(this.storeDir, { recursive: true });
    }
  }

  private getSafeFilePath(id: string): string {
    const file = path.join(this.storeDir, `${sanitizeScriptId(id)}.json`);
    const resolvedPath = path.resolve(file);
    const resolvedStoreDir = path.resolve(this.storeDir);
    if (!resolvedPath.startsWith(resolvedStoreDir)) {
      throw new Error('Path traversal attempt detected');
    }
    return resolvedPath;
  }
}
