export interface FetchVersionsInput {
  packageIds: string[];
}

export interface FetchVersionsOutput {
  versions: Record<string, string[]>;
}
