export const SHELLS = ['bash', 'zsh', 'fish'] as const;

export type ShellName = (typeof SHELLS)[number];

export class Shell {
  private constructor(public readonly value: ShellName) {}

  static create(value: string): Shell {
    if (!SHELLS.includes(value as ShellName)) {
      throw new Error(`Unsupported shell: ${value}`);
    }

    return new Shell(value as ShellName);
  }

  static bash(): Shell {
    return new Shell('bash');
  }

  static zsh(): Shell {
    return new Shell('zsh');
  }

  static fish(): Shell {
    return new Shell('fish');
  }

  equals(other: Shell): boolean {
    return this.value === other.value;
  }

  toString(): ShellName {
    return this.value;
  }
}
