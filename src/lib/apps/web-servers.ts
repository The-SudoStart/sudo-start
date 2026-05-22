import { Package } from '@/types';

export const webServerApps: Package[] = [
  {
    id: 'nginx',
    name: 'Nginx',
    description: '🌐 High-performance HTTP server and reverse proxy',
    category: 'web-server',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install nginx',
        linuxCommand: 'sudo apt-get install -y nginx',
      },
    ],
  },
  {
    id: 'apache',
    name: 'Apache',
    description: '📜 The most widely used web server software',
    category: 'web-server',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    linuxCommandTemplate: 'wget https://dlcdn.apache.org/httpd/httpd-${VERSION_NO_V}.tar.gz && tar -xzf httpd-${VERSION_NO_V}.tar.gz && cd httpd-${VERSION_NO_V} && ./configure --prefix=/usr/local/apache2 && make && sudo make install && cd .. && rm -rf httpd-${VERSION_NO_V}*',
    macosCommandTemplate: 'brew install httpd',
    versions: [
      {
        id: 'stable',
        label: 'Stable',
        macCommand: 'brew install httpd',
        linuxCommand: 'sudo apt-get install -y apache2',
      },
    ],
  },
];
