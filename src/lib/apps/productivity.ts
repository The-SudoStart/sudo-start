import { Package } from '@/types';

export const productivityApps: Package[] = [
  {
    id: 'rectangle',
    name: 'Rectangle',
    description: '🪟 Move and resize windows with keyboard shortcuts. macOS Only',
    category: 'productivity',
    platforms: { macos: true, linux: false },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask rectangle',
        linuxCommand: '# Rectangle is not available on Linux',
      },
    ],
  },
  {
    id: 'raycast',
    name: 'Raycast',
    description: '🚀 Blazingly fast launcher — replaces Spotlight & Alfred. macOS Only',
    category: 'productivity',
    platforms: { macos: true, linux: false },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask raycast',
        linuxCommand: '# Raycast is not available on Linux',
      },
    ],
  },
  {
    id: '1password',
    name: '1Password',
    description: '🔑 The world most trusted password manager',
    category: 'productivity',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask 1password',
        linuxCommand: 'curl -sS https://downloads.1password.com/linux/keys/1password.asc | sudo gpg --dearmor --output /usr/share/keyrings/1password-archive-keyring.gpg && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/1password-archive-keyring.gpg] https://downloads.1password.com/linux/debian/$(dpkg --print-architecture) stable main" | sudo tee /etc/apt/sources.list.d/1password.list && sudo apt-get update && sudo apt-get install -y 1password',
      },
    ],
  },
  {
    id: 'bitwarden',
    name: 'Bitwarden',
    description: '🛡️ Free and open-source password manager',
    category: 'productivity',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask bitwarden',
        linuxCommand: 'sudo snap install bitwarden',
      },
    ],
  },
  {
    id: 'docker-desktop',
    name: 'Docker Desktop',
    description: '🐳 GUI for Docker — container management made visual',
    category: 'productivity',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask docker',
        linuxCommand: 'curl -fsSL https://desktop.docker.com/linux/main/amd64/docker-desktop-amd64.deb -o docker-desktop.deb && sudo apt-get install -y ./docker-desktop.deb && rm docker-desktop.deb',
      },
    ],
  },
  {
    id: 'notion',
    name: 'Notion',
    description: '📝 All-in-one workspace for notes, docs, and wikis',
    category: 'productivity',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask notion',
        linuxCommand: 'echo "Notion is available via web browser or third-party clients like notion-linux"',
      },
    ],
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    description: '🧠 Knowledge base and note-taking app with graph view',
    category: 'productivity',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask obsidian',
        linuxCommand: 'wget https://github.com/obsidianmd/obsidian-releases/releases/download/v1.5.3/Obsidian-1.5.3.AppImage -O obsidian.AppImage && chmod +x obsidian.AppImage && sudo mv obsidian.AppImage /usr/local/bin/obsidian',
      },
    ],
  },
  {
    id: 'logseq',
    name: 'Logseq',
    description: '🌿 Privacy-first, open-source knowledge base',
    category: 'productivity',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask logseq',
        linuxCommand: 'wget https://github.com/logseq/logseq/releases/download/0.10.5/Logseq-linux-x64-0.10.5.AppImage -O logseq.AppImage && chmod +x logseq.AppImage && sudo mv logseq.AppImage /usr/local/bin/logseq',
      },
    ],
  },
  {
    id: 'todoist',
    name: 'Todoist',
    description: '✅ Task management and to-do list app',
    category: 'productivity',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask todoist',
        linuxCommand: 'sudo snap install todoist',
      },
    ],
  },
  {
    id: 'taskwarrior',
    name: 'Taskwarrior',
    description: '⚔️ Command-line task manager with powerful features',
    category: 'productivity',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install task',
        linuxCommand: 'sudo apt-get install -y taskwarrior',
      },
    ],
  },
  {
    id: 'timewarrior',
    name: 'Timewarrior',
    description: '⏱️ Command-line time tracking utility',
    category: 'productivity',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install timewarrior',
        linuxCommand: 'sudo apt-get install -y timewarrior',
      },
    ],
  },
  {
    id: 'calcurse',
    name: 'Calcurse',
    description: '📅 Text-based calendar and scheduling app',
    category: 'productivity',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install calcurse',
        linuxCommand: 'sudo apt-get install -y calcurse',
      },
    ],
  },
  {
    id: 'newsboat',
    name: 'Newsboat',
    description: '📰 RSS/Atom feed reader for the terminal',
    category: 'productivity',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install newsboat',
        linuxCommand: 'sudo apt-get install -y newsboat',
      },
    ],
  },
];