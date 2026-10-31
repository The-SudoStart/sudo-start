import { Package } from '@/types';

export const desktopDevApps: Package[] = [
  {
    id: 'electron',
    name: 'Electron',
    description: 'Build cross-platform desktop apps with JavaScript, HTML, and CSS',
    category: 'desktop-dev',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'npm install -g electron',
        linuxCommand: 'npm install -g electron',
      },
    ],
  },
  {
    id: 'tauri',
    name: 'Tauri',
    description: 'Optimized, secure, and frontend-independent application framework',
    category: 'desktop-dev',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && npm install -g @tauri-apps/cli',
        linuxCommand: 'sudo apt-get update && sudo apt-get install -y libwebkit2gtk-4.0-dev build-essential curl wget file libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev && curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && npm install -g @tauri-apps/cli',
      },
    ],
  },
  {
    id: 'qt',
    name: 'Qt',
    description: 'Cross-platform application development framework',
    category: 'desktop-dev',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install qt',
        linuxCommand: 'sudo apt-get install -y qtbase5-dev qtchooser qt5-qmake qtbase5-dev-tools',
      },
    ],
  },
];
