import { Package } from '@/types';
import { ideApps } from './ides';
import { browserApps } from './browsers';
import { runtimeApps } from './runtimes';
import { toolApps } from './tools';
import { containerApps } from './containers';
import { databaseApps } from './databases';
import { terminalApps } from './terminals';
import { frameworkApps } from './frameworks';
import { devopsApps } from './devops';
import { dataScienceApps } from './data-science';
import { mobileApps } from './mobile';
import { gameDevApps } from './game-dev';
import { desktopDevApps } from './desktop-dev';
import { webServerApps } from './web-servers';
import { packageManagerApps } from './package-managers';
import { buildToolApps } from './build-tools';
import { cloudCliApps } from './cloud-clis';
import { utilityApps } from './utilities';
import { communicationApps } from './communication';
import { productivityApps } from './productivity';
import { securityApps } from './security';
import { mediaApps } from './media';
import { vcsApps } from './vcs';

export const appCatalog: Package[] = [
  ...ideApps,
  ...browserApps,
  ...runtimeApps,
  ...toolApps,
  ...packageManagerApps,
  ...buildToolApps,
  ...containerApps,
  ...databaseApps,
  ...terminalApps,
  ...frameworkApps,
  ...devopsApps,
  ...dataScienceApps,
  ...mobileApps,
  ...gameDevApps,
  ...desktopDevApps,
  ...webServerApps,
  ...cloudCliApps,
  ...utilityApps,
  ...communicationApps,
  ...productivityApps,
  ...securityApps,
  ...mediaApps,
  ...vcsApps,
];

export function getAppsForOS(os: 'macos' | 'linux'): Package[] {
  return appCatalog.filter((app) => app.platforms[os]);
}

export function getAppsByCategory(category: string): Package[] {
  return appCatalog.filter((app) => app.category === category);
}

export function requiresFlatpak(pkg: Package): boolean {
  return pkg.versions.some((v) => v.linuxCommand.includes('flatpak'));
}

export function getDefaultApps(): Package[] {
  const defaultAppIds = [
    'vscode',
    'cursor',
    'google-chrome',
    'git',
    'curl',
    'wget',
    'nvm',
    'nodejs',
    'npm',
    'python3',
    'docker',
    'postgresql',
    'zsh',
    'oh-my-zsh',
    'jq',
    'htop',
  ];
  return appCatalog.filter((app) => defaultAppIds.includes(app.id));
}