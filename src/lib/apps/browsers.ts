import { Package } from '@/types';

export const browserApps: Package[] = [
  {
    id: 'zen-browser',
    name: 'Zen Browser',
    description: '🎨 Beautiful Firefox fork with vertical tabs & privacy focus',
    category: 'browser',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask zen-browser',
        linuxCommand: 'flatpak install flathub io.github.zen_browser.zen -y',
      },
    ],
  },
  {
    id: 'arc',
    name: 'Arc Browser',
    description: '🌈 The Chrome replacement. Mac Only',
    category: 'browser',
    platforms: { macos: true, linux: false },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask arc',
        linuxCommand: '# Arc is not available on Linux',
      },
    ],
  },
  {
    id: 'vivaldi',
    name: 'Vivaldi',
    description: '🎭 Power user browser with extensive customization',
    category: 'browser',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask vivaldi',
        linuxCommand: 'wget -qO- https://repo.vivaldi.com/archive/linux_signing_key.pub | gpg --dearmor | sudo dd of=/usr/share/keyrings/vivaldi-browser.gpg && echo "deb [signed-by=/usr/share/keyrings/vivaldi-browser.gpg] https://repo.vivaldi.com/archive/deb/ stable main" | sudo tee /etc/apt/sources.list.d/vivaldi.list && sudo apt update && sudo apt install vivaldi-stable -y',
      },
    ],
  },
  {
    id: 'brave',
    name: 'Brave',
    description: '🦁 Privacy-focused browser with built-in ad blocking',
    category: 'browser',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask brave-browser',
        linuxCommand: 'sudo curl -fsSLo /usr/share/keyrings/brave-browser-archive-keyring.gpg https://brave-browser-apt-release.s3.brave.com/brave-browser-archive-keyring.gpg && echo "deb [signed-by=/usr/share/keyrings/brave-browser-archive-keyring.gpg] https://brave-browser-apt-release.s3.brave.com/ stable main" | sudo tee /etc/apt/sources.list.d/brave-browser-release.list && sudo apt update && sudo apt install brave-browser -y',
      },
    ],
  },
  {
    id: 'google-chrome',
    name: 'Google Chrome',
    description: '🌐 Fast, secure web browser by Google',
    category: 'browser',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask google-chrome',
        linuxCommand: 'wget -qO- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor | sudo tee /usr/share/keyrings/google-chrome.gpg > /dev/null && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list && sudo apt-get update && sudo apt-get install -y google-chrome-stable',
      },
    ],
  },
  {
    id: 'microsoft-edge',
    name: 'Microsoft Edge',
    description: '🔷 Fast and secure browser from Microsoft, built on Chromium',
    category: 'browser',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask microsoft-edge',
        linuxCommand: 'curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor | sudo tee /usr/share/keyrings/microsoft-edge.gpg > /dev/null && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft-edge.gpg] https://packages.microsoft.com/repos/edge stable main" | sudo tee /etc/apt/sources.list.d/microsoft-edge.list && sudo apt-get update && sudo apt-get install -y microsoft-edge-stable',
      },
      {
        id: 'beta',
        label: 'Beta',
        macCommand: 'brew install --cask microsoft-edge-beta',
        linuxCommand: 'curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor | sudo tee /usr/share/keyrings/microsoft-edge.gpg > /dev/null && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft-edge.gpg] https://packages.microsoft.com/repos/edge stable main" | sudo tee /etc/apt/sources.list.d/microsoft-edge.list && sudo apt-get update && sudo apt-get install -y microsoft-edge-beta',
      },
    ],
  },
  {
    id: 'firefox',
    name: 'Firefox',
    description: '🦊 Open-source web browser by Mozilla',
    category: 'browser',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask firefox',
        linuxCommand: 'sudo apt-get install -y firefox',
      },
    ],
  },
];