import { Package } from '@/types';

export const dataScienceApps: Package[] = [
  {
    id: 'jupyter',
    name: 'JupyterLab',
    description: '📓 Web-based interactive development environment for notebooks',
    category: 'data-science',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    linuxCommandTemplate: 'pip3 install jupyterlab==${VERSION_NO_V}',
    macosCommandTemplate: 'pip3 install jupyterlab==${VERSION_NO_V}',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'pip3 install jupyterlab',
        linuxCommand: 'pip3 install jupyterlab',
      },
    ],
  },
  {
    id: 'tensorflow',
    name: 'TensorFlow',
    description: '🧠 End-to-end open source platform for machine learning',
    category: 'data-science',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    linuxCommandTemplate: 'pip3 install tensorflow==${VERSION_NO_V}',
    macosCommandTemplate: 'pip3 install tensorflow==${VERSION_NO_V}',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'pip3 install tensorflow',
        linuxCommand: 'pip3 install tensorflow',
      },
    ],
  },
  {
    id: 'pandas',
    name: 'Pandas',
    description: '🐼 Fast, powerful, flexible data analysis tool',
    category: 'data-science',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    linuxCommandTemplate: 'pip3 install pandas==${VERSION_NO_V}',
    macosCommandTemplate: 'pip3 install pandas==${VERSION_NO_V}',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'pip3 install pandas',
        linuxCommand: 'pip3 install pandas',
      },
    ],
  },
  {
    id: 'numpy',
    name: 'NumPy',
    description: '🔢 Fundamental package for scientific computing',
    category: 'data-science',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    linuxCommandTemplate: 'pip3 install numpy==${VERSION_NO_V}',
    macosCommandTemplate: 'pip3 install numpy==${VERSION_NO_V}',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'pip3 install numpy',
        linuxCommand: 'pip3 install numpy',
      },
    ],
  },
  {
    id: 'matplotlib',
    name: 'Matplotlib',
    description: '📈 Comprehensive library for creating static, animated, and interactive visualizations',
    category: 'data-science',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    linuxCommandTemplate: 'pip3 install matplotlib==${VERSION_NO_V}',
    macosCommandTemplate: 'pip3 install matplotlib==${VERSION_NO_V}',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'pip3 install matplotlib',
        linuxCommand: 'pip3 install matplotlib',
      },
    ],
  },
];
