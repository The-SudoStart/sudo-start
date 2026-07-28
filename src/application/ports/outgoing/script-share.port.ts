export interface ScriptShareRecord {
  script: string;
  createdAt: number;
  meta: { os: string; packages: string[] };
}

export interface ScriptSharePort {
  create(entry: Omit<ScriptShareRecord, 'createdAt'>): Promise<string>;
  findById(id: string): Promise<ScriptShareRecord | null>;
}
