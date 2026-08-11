import { describe, expect, it } from 'vitest';
import { PackageEntity } from './package';
import { Script } from './script';
import { Platform } from '../value-objects/platform';
import { Shell } from '../value-objects/shell';

const pkg = new PackageEntity({
  id: 'git',
  name: 'Git',
  description: 'Version control',
  category: 'vcs',
  platforms: { macos: true, linux: true },
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

describe('Script', () => {
  it('validates content and platform support', () => {
    const script = new Script({
      content: '#!/bin/bash',
      packages: [pkg],
      targetPlatform: Platform.linux(),
      shell: Shell.bash(),
    });

    expect(script.validate()).toBe(true);
    expect(script.toString()).toBe('#!/bin/bash');
  });
});
