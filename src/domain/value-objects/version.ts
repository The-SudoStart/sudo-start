import { isValidVersion, sanitizeVersion } from '@/lib/security';

export class Version {
  private constructor(public readonly value: string) {}

  static create(value: string): Version {
    if (!isValidVersion(value)) {
      throw new Error(`Invalid version: ${value}`);
    }

    return new Version(sanitizeVersion(value));
  }

  static optional(value: string | undefined): Version | null {
    if (!value) return null;
    return Version.create(value);
  }

  equals(other: Version): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
