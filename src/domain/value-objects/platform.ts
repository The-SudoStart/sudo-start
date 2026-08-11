export const PLATFORMS = ['macos', 'linux', 'windows'] as const;

export type PlatformName = (typeof PLATFORMS)[number];

export class Platform {
  private constructor(public readonly value: PlatformName) {}

  static create(value: string): Platform {
    if (!PLATFORMS.includes(value as PlatformName)) {
      throw new Error(`Unsupported platform: ${value}`);
    }

    return new Platform(value as PlatformName);
  }

  static macOS(): Platform {
    return new Platform('macos');
  }

  static linux(): Platform {
    return new Platform('linux');
  }

  static windows(): Platform {
    return new Platform('windows');
  }

  equals(other: Platform): boolean {
    return this.value === other.value;
  }

  toString(): PlatformName {
    return this.value;
  }
}
