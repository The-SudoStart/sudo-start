import { Package } from '@/types';

export const vcsApps: Package[] = [
  {
    id: 'git-lfs',
    name: 'Git LFS',
    description: '📦 Git Large File Storage — version control for large files',
    category: 'vcs',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install git-lfs',
        linuxCommand: 'sudo apt-get install -y git-lfs',
      },
    ],
  },
  {
    id: 'github-desktop',
    name: 'GitHub Desktop',
    description: '🐙 GUI for Git and GitHub — simplifies your workflow',
    category: 'vcs',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask github',
        linuxCommand: 'wget https://github.com/shiftkey/desktop/releases/download/release-3.3.6-linux1/GitHubDesktop-linux-amd64-3.3.6-linux1.deb -O github-desktop.deb && sudo apt install ./github-desktop.deb -y && rm github-desktop.deb',
      },
    ],
  },
  {
    id: 'sublime-merge',
    name: 'Sublime Merge',
    description: '🔀 Git client from the makers of Sublime Text',
    category: 'vcs',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask sublime-merge',
        linuxCommand: 'wget https://download.sublimetext.com/sublime-merge_build-2096_amd64.deb -O sublime-merge.deb && sudo apt install ./sublime-merge.deb -y && rm sublime-merge.deb',
      },
    ],
  },
  {
    id: 'fork',
    name: 'Fork',
    description: '🍴 Fast and friendly Git client',
    category: 'vcs',
    platforms: { macos: true, linux: false },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask fork',
        linuxCommand: 'echo "Fork is macOS and Windows only"',
      },
    ],
  },
  {
    id: 'tower',
    name: 'Tower',
    description: '🏰 Powerful Git client for Mac and Windows',
    category: 'vcs',
    platforms: { macos: true, linux: false },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask tower',
        linuxCommand: 'echo "Tower is macOS and Windows only"',
      },
    ],
  },
];
