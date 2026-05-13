import { Package } from '@/types';

export const mobileApps: Package[] = [
  {
    id: 'flutter',
    name: 'Flutter',
    description: '💙 Google’s UI toolkit for building natively compiled applications',
    category: 'mobile',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    linuxCommandTemplate: "git clone https://github.com/flutter/flutter.git -b ${VERSION_NO_V} \$HOME/flutter && echo 'export PATH=\$PATH:\$HOME/flutter/bin' >> ~/.bashrc",
    macosCommandTemplate: 'brew install --cask flutter@${VERSION}',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask flutter',
        linuxCommand: "git clone https://github.com/flutter/flutter.git -b stable \$HOME/flutter && echo 'export PATH=\$PATH:\$HOME/flutter/bin' >> ~/.bashrc",
      },
    ],
  },
  {
    id: 'react-native',
    name: 'React Native',
    description: '⚛️ Build native mobile apps using React',
    category: 'mobile',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'npm install -g react-native-cli',
        linuxCommand: 'npm install -g react-native-cli',
      },
    ],
  },
  {
    id: 'ionic',
    name: 'Ionic CLI',
    description: '⚡ Cross-platform mobile app development',
    category: 'mobile',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'npm install -g @ionic/cli',
        linuxCommand: 'npm install -g @ionic/cli',
      },
    ],
  },
  {
    id: 'cordova',
    name: 'Apache Cordova',
    description: '📱 Mobile apps with HTML, CSS & JS',
    category: 'mobile',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'npm install -g cordova',
        linuxCommand: 'npm install -g cordova',
      },
    ],
  },
  {
    id: 'xcode',
    name: 'Xcode Select',
    description: '🛠️ Command line tools for macOS',
    category: 'mobile',
    platforms: { macos: true, linux: false },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'xcode-select --install',
        linuxCommand: '# Not available on Linux',
      },
    ],
  },
];
