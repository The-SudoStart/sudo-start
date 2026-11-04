import { Package } from '@/types';

export const gameDevApps: Package[] = [
  {
    id: 'godot',
    name: 'Godot Engine',
    description: 'Free and open source 2D and 3D game engine',
    category: 'game-dev',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask godot',
        linuxCommand: 'sudo apt-get install -y godot',
      },
    ],
  },
  {
    id: 'unity',
    name: 'Unity Hub',
    description: 'Real-time 3D development platform',
    category: 'game-dev',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask unity-hub',
        linuxCommand: 'wget -qO - https://hub.unity3d.com/linux/keys/public.gpg | gpg --dearmor | sudo tee /usr/share/keyrings/Unity_Technologies_ApS.gpg > /dev/null && echo "deb [signed-by=/usr/share/keyrings/Unity_Technologies_ApS.gpg] https://hub.unity3d.com/linux/repos/deb stable main" | sudo tee /etc/apt/sources.list.d/unityhub.list && sudo apt-get update && sudo apt-get install -y unityhub',
      },
    ],
  },
  {
    id: 'unreal-engine',
    name: 'Unreal Engine',
    description: 'The world’s most open and advanced real-time 3D creation tool',
    category: 'game-dev',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'echo "Unreal Engine must be downloaded via the Epic Games Launcher."',
        linuxCommand: 'echo "Unreal Engine for Linux must be compiled from source. Visit https://www.unrealengine.com/linux"',
      },
    ],
  },
  {
    id: 'blender',
    name: 'Blender',
    description: 'Open source 3D creation suite',
    category: 'game-dev',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install --cask blender',
        linuxCommand: 'sudo apt-get install -y blender',
      },
    ],
  },
];
