import { OS, Package } from '@/types';

const GENERIC_VERSIONS = ['stable', 'latest'];

export interface GetPreviewCommandInput {
  package: Package;
  platform: OS | null;
  version: string;
}

export class GetPreviewCommandUseCase {
  execute(input: GetPreviewCommandInput): string {
    const { package: pkg, platform, version } = input;
    if (!platform) return '';

    const versionEntry = pkg.versions.find((candidate) => candidate.id === version);
    const template = platform === 'macos' ? pkg.macosCommandTemplate : pkg.linuxCommandTemplate;
    const isGeneric = GENERIC_VERSIONS.includes(version);

    if (template && !isGeneric) {
      const v = version.startsWith('v') ? version : `v${version}`;
      const vNoV = version.startsWith('v') ? version.slice(1) : version;
      const vMajor = vNoV.split('.')[0];
      return template
        .replaceAll('${VERSION}', v)
        .replaceAll('${VERSION_NO_V}', vNoV)
        .replaceAll('${VERSION_MAJOR}', vMajor);
    }

    return versionEntry
      ? (platform === 'macos' ? versionEntry.macCommand : versionEntry.linuxCommand)
      : '';
  }
}
