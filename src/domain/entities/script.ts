import { PackageEntity } from './package';
import { Platform } from '../value-objects/platform';
import { Shell } from '../value-objects/shell';

export interface ScriptProps {
  content: string;
  packages: PackageEntity[];
  targetPlatform: Platform;
  shell: Shell;
}

export class Script {
  readonly content: string;
  readonly packages: readonly PackageEntity[];
  readonly targetPlatform: Platform;
  readonly shell: Shell;

  constructor(props: ScriptProps) {
    this.content = props.content;
    this.packages = [...props.packages];
    this.targetPlatform = props.targetPlatform;
    this.shell = props.shell;
  }

  validate(): boolean {
    return this.content.trim().length > 0
      && this.packages.every((pkg) => pkg.supportsPlatform(this.targetPlatform));
  }

  toString(): string {
    return this.content;
  }
}
