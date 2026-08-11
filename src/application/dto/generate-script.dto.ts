import { OS, Package, Shell } from '@/types';

export interface GenerateScriptInput {
  packages: Package[];
  platform: OS;
  shell: Shell;
}

export interface GenerateScriptOutput {
  script: string;
}
