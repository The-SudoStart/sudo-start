import { Package } from '@/types';

export const buildToolApps: Package[] = [
  {
    id: 'make',
    name: 'Make',
    description: 'Universal build automation tool',
    category: 'build-tool',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install make',
        linuxCommand: 'sudo apt-get install -y make',
      },
    ],
  },
  {
    id: 'cmake',
    name: 'CMake',
    description: 'Cross-platform build system generator for C/C++ projects',
    category: 'build-tool',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install cmake',
        linuxCommand: 'sudo apt-get install -y cmake',
      },
    ],
  },
  {
    id: 'gradle',
    name: 'Gradle',
    description: 'Powerful build tool for JVM, Android & polyglot projects',
    category: 'build-tool',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install gradle',
        linuxCommand: 'sudo apt-get install -y gradle',
      },
    ],
  },
  {
    id: 'maven',
    name: 'Apache Maven',
    description: 'Project management and build tool for Java projects',
    category: 'build-tool',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install maven',
        linuxCommand: 'sudo apt-get install -y maven',
      },
    ],
  },
];