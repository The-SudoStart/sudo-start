import { describe, expect, it } from 'vitest';
import { GenerateScriptUseCase } from './generate-script.use-case';
import { Package } from '@/types';

const pkg: Package = {
  id: 'git',
  name: 'Git',
  description: 'Version control',
  category: 'vcs',
  platforms: { macos: true, linux: true },
  defaultVersion: 'stable',
  versions: [
    {
      id: 'stable',
      label: 'Stable',
      macCommand: 'brew install git',
      linuxCommand: 'sudo apt-get install -y git',
    },
  ],
};

describe('GenerateScriptUseCase', () => {
  it('generates a script entity payload', async () => {
    const result = await new GenerateScriptUseCase().execute({
      platform: 'linux',
      shell: 'bash',
      packages: [pkg],
    });

    expect(result.script).toContain('SudoStart');
    expect(result.script).toContain('sudo apt-get install -y git');
  });

  it('supports synchronous execution for browser presentation code', () => {
    const result = new GenerateScriptUseCase().executeSync({
      platform: 'macos',
      shell: 'zsh',
      packages: [pkg],
    });

    expect(result.script).toContain('brew install git');
  });
});
