import { Package } from '@/types';

export const mediaApps: Package[] = [
  {
    id: 'gimp',
    name: 'GIMP',
    description: '🎨 GNU Image Manipulation Program — free Photoshop alternative',
    category: 'media',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask gimp',
        linuxCommand: 'sudo apt-get install -y gimp',
      },
    ],
  },
  {
    id: 'inkscape',
    name: 'Inkscape',
    description: '✏️ Professional vector graphics editor',
    category: 'media',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask inkscape',
        linuxCommand: 'sudo apt-get install -y inkscape',
      },
    ],
  },
  {
    id: 'krita',
    name: 'Krita',
    description: '🖌️ Professional digital painting application',
    category: 'media',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask krita',
        linuxCommand: 'sudo apt-get install -y krita',
      },
    ],
  },
  {
    id: 'audacity',
    name: 'Audacity',
    description: '🎙️ Free, open-source audio editor and recorder',
    category: 'media',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask audacity',
        linuxCommand: 'sudo apt-get install -y audacity',
      },
    ],
  },
  {
    id: 'obs-studio',
    name: 'OBS Studio',
    description: '🎥 Free software for video recording and live streaming',
    category: 'media',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask obs',
        linuxCommand: 'sudo apt-get install -y obs-studio',
      },
    ],
  },
  {
    id: 'ffmpeg',
    name: 'FFmpeg',
    description: '🎬 Complete solution to record, convert and stream audio and video',
    category: 'media',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install ffmpeg',
        linuxCommand: 'sudo apt-get install -y ffmpeg',
      },
    ],
  },
  {
    id: 'imagemagick',
    name: 'ImageMagick',
    description: '🖼️ Software suite to create, edit, and compose bitmap images',
    category: 'media',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install imagemagick',
        linuxCommand: 'sudo apt-get install -y imagemagick',
      },
    ],
  },
];
