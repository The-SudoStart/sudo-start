import { describe, expect, it } from 'vitest';
import {
  estimateDiskSpace,
  estimateInstallTime,
  generateBrewfile,
  generateScript,
} from './script-generator';
import { Package } from '@/types';

const git: Package = {
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

const vscode: Package = {
  id: 'vscode',
  name: 'VS Code',
  description: 'Editor',
  category: 'ide',
  platforms: { macos: true, linux: true },
  defaultVersion: 'stable',
  versions: [
    {
      id: 'stable',
      label: 'Stable',
      macCommand: 'brew install --cask visual-studio-code',
      linuxCommand: 'sudo snap install code --classic',
    },
  ],
  versionNote: 'Team standard',
};

const nodejs: Package = {
  id: 'nodejs',
  name: 'Node.js',
  description: 'Runtime',
  category: 'runtime',
  platforms: { macos: true, linux: true },
  defaultVersion: '20.0.0',
  selectedVersion: '20.0.0',
  versions: [
    {
      id: '20.0.0',
      label: '20.0.0',
      macCommand: 'brew install node@20',
      linuxCommand: 'curl -fsSL https://nodejs.org/dist/v20.0.0/node.tar.gz',
    },
  ],
  macosCommandTemplate: 'brew install node@${VERSION_MAJOR}',
  linuxCommandTemplate: 'curl -fsSL https://nodejs.org/dist/${VERSION}/node-${VERSION_NO_V}.tar.gz',
};

const flatpakApp: Package = {
  id: 'gimp',
  name: 'GIMP',
  description: 'Image editor',
  category: 'media',
  platforms: { macos: false, linux: true },
  defaultVersion: 'stable',
  versions: [
    {
      id: 'stable',
      label: 'Stable',
      macCommand: '# unavailable',
      linuxCommand: 'flatpak install -y flathub org.gimp.GIMP',
    },
  ],
};

describe('script-generator', () => {
  it('generates Linux install scripts', () => {
    const script = generateScript('linux', 'bash', [git]);

    expect(script).toContain('sudo apt-get update');
    expect(script).toContain('sudo apt-get install -y git');
  });

  it('generates macOS install scripts and Brewfiles', () => {
    const script = generateScript('macos', 'zsh', [vscode]);
    const brewfile = generateBrewfile([vscode]);

    expect(script).toContain('Installing Homebrew');
    expect(brewfile).toContain('cask "visual-studio-code"');
    expect(brewfile).toContain('Team standard');
  });

  it('renders template-based version commands', () => {
    const script = generateScript('linux', 'bash', [nodejs]);

    expect(script).toContain('node-20.0.0.tar.gz');
  });

  it('bootstraps Flatpak when a Linux package requires it', () => {
    const script = generateScript('linux', 'bash', [flatpakApp]);

    expect(script).toContain('Installing Flatpak');
    expect(script).toContain('flatpak install -y flathub org.gimp.GIMP');
  });

  it('falls back to defaults when selected version is invalid', () => {
    const script = generateScript('linux', 'bash', [{ ...git, selectedVersion: 'bad;version' }]);

    expect(script).toContain('sudo apt-get install -y git');
  });

  it('returns a guidance script when platform or shell is missing', () => {
    expect(generateScript(null, null, [])).toContain('Please select');
  });

  it('estimates install cost', () => {
    expect(estimateInstallTime([git, vscode])).toBeGreaterThan(0);
    expect(estimateDiskSpace([git, vscode])).toBeGreaterThan(0);
  });
});
