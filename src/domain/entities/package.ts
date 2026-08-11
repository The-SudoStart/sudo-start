import { Category, Package as PackageDTO, PlatformSupport } from '@/types';
import { Platform, PlatformName } from '../value-objects/platform';

export interface InstallCommand {
  version: string;
  label: string;
  macos: string;
  linux: string;
  windows?: string;
}

export interface PackageProps {
  id: string;
  name: string;
  description: string;
  category: Category;
  platforms: PlatformSupport & { windows?: boolean };
  installCommands: InstallCommand[];
  defaultVersion: string;
  selectedVersion?: string;
  versionNote?: string;
  icon?: string;
  macosCommandTemplate?: string;
  linuxCommandTemplate?: string;
}

export class PackageEntity {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: Category;
  readonly platforms: PackageProps['platforms'];
  readonly installCommands: readonly InstallCommand[];
  readonly defaultVersion: string;
  readonly selectedVersion?: string;
  readonly versionNote?: string;
  readonly icon?: string;
  readonly macosCommandTemplate?: string;
  readonly linuxCommandTemplate?: string;

  constructor(props: PackageProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.category = props.category;
    this.platforms = { ...props.platforms };
    this.installCommands = props.installCommands.map((command) => ({ ...command }));
    this.defaultVersion = props.defaultVersion;
    this.selectedVersion = props.selectedVersion;
    this.versionNote = props.versionNote;
    this.icon = props.icon;
    this.macosCommandTemplate = props.macosCommandTemplate;
    this.linuxCommandTemplate = props.linuxCommandTemplate;
  }

  static fromDTO(pkg: PackageDTO): PackageEntity {
    return new PackageEntity({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      category: pkg.category,
      platforms: pkg.platforms,
      installCommands: pkg.versions.map((version) => ({
        version: version.id,
        label: version.label,
        macos: version.macCommand,
        linux: version.linuxCommand,
      })),
      defaultVersion: pkg.defaultVersion,
      selectedVersion: pkg.selectedVersion,
      versionNote: pkg.versionNote,
      icon: pkg.icon,
      macosCommandTemplate: pkg.macosCommandTemplate,
      linuxCommandTemplate: pkg.linuxCommandTemplate,
    });
  }

  supportsPlatform(platform: Platform | PlatformName): boolean {
    const platformName = typeof platform === 'string' ? platform : platform.value;
    return Boolean(this.platforms[platformName as keyof typeof this.platforms]);
  }

  getInstallCommand(platform: Platform | PlatformName, version = this.selectedVersion ?? this.defaultVersion): string {
    const platformName = typeof platform === 'string' ? platform : platform.value;
    const command = this.installCommands.find((candidate) => candidate.version === version)
      ?? this.installCommands.find((candidate) => candidate.version === this.defaultVersion)
      ?? this.installCommands[0];

    if (!command) return '';

    return command[platformName as keyof InstallCommand]?.toString() ?? '';
  }

  toDTO(): PackageDTO {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      icon: this.icon,
      platforms: {
        macos: this.platforms.macos,
        linux: this.platforms.linux,
      },
      defaultVersion: this.defaultVersion,
      versions: this.installCommands.map((command) => ({
        id: command.version,
        label: command.label,
        macCommand: command.macos,
        linuxCommand: command.linux,
      })),
      selectedVersion: this.selectedVersion,
      versionNote: this.versionNote,
      macosCommandTemplate: this.macosCommandTemplate,
      linuxCommandTemplate: this.linuxCommandTemplate,
    };
  }
}
