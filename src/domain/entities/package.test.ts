import { describe, expect, it } from 'vitest';
import { PackageEntity } from './package';

const pkg = new PackageEntity({
  id: 'git',
  name: 'Git',
  description: 'Version control',
  category: 'vcs',
  platforms: { macos: true, linux: true, windows: false },
  defaultVersion: 'stable',
  installCommands: [
    {
      version: 'stable',
      label: 'Stable',
      macos: 'brew install git',
      linux: 'sudo apt-get install -y git',
    },
  ],
});

describe('PackageEntity', () => {
  it('reports supported platforms', () => {
    expect(pkg.supportsPlatform('macos')).toBe(true);
    expect(pkg.supportsPlatform('windows')).toBe(false);
  });

  it('resolves install commands by platform', () => {
    expect(pkg.getInstallCommand('linux')).toBe('sudo apt-get install -y git');
  });
});
