import { Package } from '@/types';

export const terminalApps: Package[] = [
  {
    id: 'iterm2',
    name: 'iTerm2',
    description: '🖥️ Terminal emulator for macOS with powerful features',
    category: 'terminal',
    platforms: { macos: true, linux: false },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask iterm2',
        linuxCommand: '# Not available on Linux',
      },
    ],
  },
  {
    id: 'warp',
    name: 'Warp',
    description: '🚀 The terminal for the 21st century with AI built in',
    category: 'terminal',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask warp',
        linuxCommand: 'curl -fsSL https://releases.warp.dev/linux/keys/warp.asc | gpg --dearmor > warp.gpg && sudo install -D -o root -g root -m 644 warp.gpg /etc/apt/keyrings/warp.gpg && echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/warp.gpg] https://releases.warp.dev/linux/deb stable main" | sudo tee /etc/apt/sources.list.d/warp.list > /dev/null && rm warp.gpg && sudo apt update && sudo apt install warp-terminal -y',
      },
    ],
  },
  {
    id: 'alacritty',
    name: 'Alacritty',
    description: '⚡ GPU-accelerated terminal emulator — fast and minimal',
    category: 'terminal',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    linuxCommandTemplate: 'wget https://github.com/alacritty/alacritty/releases/download/${VERSION}/Alacritty-${VERSION_NO_V}.tar.gz && tar -xzf Alacritty-${VERSION_NO_V}.tar.gz && sudo install -D -m755 Alacritty-${VERSION_NO_V}/alacritty /usr/local/bin/alacritty && rm -rf Alacritty-${VERSION_NO_V}*',
    macosCommandTemplate: 'brew install --cask alacritty',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask alacritty',
        linuxCommand: 'sudo apt-get install -y alacritty',
      },
    ],
  },
  {
    id: 'kitty',
    name: 'Kitty',
    description: '🐱 Fast, feature-rich GPU-based terminal emulator',
    category: 'terminal',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    linuxCommandTemplate: 'curl -L https://sw.kovidgoyal.net/kitty/installer.sh | sh /dev/stdin launch=n && ln -sf ~/.local/kitty.app/bin/kitty ~/.local/bin/',
    macosCommandTemplate: 'brew install --cask kitty',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask kitty',
        linuxCommand: 'curl -L https://sw.kovidgoyal.net/kitty/installer.sh | sh /dev/stdin && ln -sf ~/.local/kitty.app/bin/kitty ~/.local/kitty.app/bin/kitten ~/.local/bin/',
      },
    ],
  },
  {
    id: 'hyper',
    name: 'Hyper',
    description: '💻 Electron-based terminal built on web technologies',
    category: 'terminal',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    linuxCommandTemplate: 'wget https://github.com/vercel/hyper/releases/download/${VERSION}/hyper_${VERSION_NO_V}_amd64.deb -O hyper.deb && sudo apt install ./hyper.deb -y && rm hyper.deb',
    macosCommandTemplate: 'brew install --cask hyper',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask hyper',
        linuxCommand: 'wget https://releases.hyper.is/download/deb -O hyper.deb && sudo apt install ./hyper.deb -y && rm hyper.deb',
      },
    ],
  },
  {
    id: 'ghostty',
    name: 'Ghostty',
    description: '👻 Fast, native terminal emulator with platform-native UI',
    category: 'terminal',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask ghostty',
        linuxCommand: 'sudo apt-get install -y ghostty',
      },
    ],
  },
];