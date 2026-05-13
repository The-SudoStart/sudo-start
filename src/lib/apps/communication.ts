import { Package } from '@/types';

export const communicationApps: Package[] = [
  {
    id: 'zoom',
    name: 'Zoom',
    description: '📹 Video conferencing — the standard for remote dev teams',
    category: 'communication',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask zoom',
        linuxCommand: 'wget https://zoom.us/client/latest/zoom_amd64.deb -O zoom.deb && sudo apt install ./zoom.deb -y && rm zoom.deb',
      },
    ],
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: '👥 Enterprise collaboration platform by Microsoft',
    category: 'communication',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask microsoft-teams',
        linuxCommand: 'echo "⚠ Microsoft has retired the official Teams for Linux desktop app. Please use the Teams PWA in your browser (Edge/Chrome recommended)."',
      },
    ],
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: '✈️ Fast, secure messaging app — popular in open-source communities',
    category: 'communication',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask telegram',
        linuxCommand: 'sudo apt-get install -y telegram-desktop',
      },
    ],
  },
];