import { Package } from '@/types';

export const packageManagerApps: Package[] = [
  {
    id: 'pnpm',
    name: 'pnpm',
    description: '⚡ Fast, disk space efficient package manager for Node.js',
    category: 'package-manager',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install pnpm',
        linuxCommand: 'curl -fsSL https://get.pnpm.io/install.sh | sh -',
      },
    ],
  },
  {
    id: 'yarn',
    name: 'Yarn',
    description: '🧶 Fast, reliable, and secure dependency management',
    category: 'package-manager',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable (via npm)',
        macCommand: 'npm install -g yarn',
        linuxCommand: 'sudo npm install -g yarn',
      },
      {
        id: 'brew',
        label: 'via Homebrew (macOS)',
        macCommand: 'brew install yarn',
        linuxCommand: 'curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | sudo tee /usr/share/keyrings/yarn.gpg > /dev/null && echo "deb [signed-by=/usr/share/keyrings/yarn.gpg] https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list && sudo apt-get update && sudo apt-get install -y yarn',
      },
    ],
  },
  {
    id: 'pyenv',
    name: 'pyenv',
    description: '🐍 Simple Python version management',
    category: 'package-manager',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install pyenv && echo \'export PYENV_ROOT="$HOME/.pyenv"\' >> ~/.zshrc && echo \'export PATH="$PYENV_ROOT/bin:$PATH"\' >> ~/.zshrc && echo \'eval "$(pyenv init -)"\' >> ~/.zshrc',
        linuxCommand: 'sudo apt-get install -y make build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev && curl https://pyenv.run | bash && echo \'export PYENV_ROOT="$HOME/.pyenv"\' >> ~/.bashrc && echo \'[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"\' >> ~/.bashrc && echo \'eval "$(pyenv init -)"\' >> ~/.bashrc',
      },
    ],
  },
  {
    id: 'rbenv',
    name: 'rbenv',
    description: '💎 Manage your Ruby versions with ease',
    category: 'package-manager',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install rbenv ruby-build && rbenv init',
        linuxCommand: 'sudo apt-get install -y rbenv && git clone https://github.com/rbenv/ruby-build.git "$(rbenv root)"/plugins/ruby-build && echo \'eval "$(rbenv init - bash)"\' >> ~/.bashrc',
      },
    ],
  },
  {
    id: 'sdkman',
    name: 'SDKMAN!',
    description: '☕ Manage parallel versions of SDKs (Java, Kotlin, Gradle, Maven…)',
    category: 'package-manager',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'curl -s "https://get.sdkman.io" | bash && source "$HOME/.sdkman/bin/sdkman-init.sh"',
        linuxCommand: 'curl -s "https://get.sdkman.io" | bash && source "$HOME/.sdkman/bin/sdkman-init.sh"',
      },
    ],
  },
];