export interface ShareScriptInput {
  script: string;
  os?: string;
  packages?: string[];
}

export interface ShareScriptOutput {
  id: string;
}
