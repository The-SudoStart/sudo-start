import { describe, expect, it } from 'vitest';
import { Platform } from './platform';
import { Shell } from './shell';
import { Version } from './version';

describe('value objects', () => {
  it('creates and compares platforms', () => {
    expect(Platform.create('macos').equals(Platform.macOS())).toBe(true);
    expect(Platform.linux().toString()).toBe('linux');
    expect(Platform.windows().toString()).toBe('windows');
    expect(() => Platform.create('solaris')).toThrow('Unsupported platform');
  });

  it('creates and compares shells', () => {
    expect(Shell.create('bash').equals(Shell.bash())).toBe(true);
    expect(Shell.zsh().toString()).toBe('zsh');
    expect(Shell.fish().toString()).toBe('fish');
    expect(() => Shell.create('powershell')).toThrow('Unsupported shell');
  });

  it('validates immutable versions', () => {
    const version = Version.create('v1.2.3');

    expect(version.toString()).toBe('v1.2.3');
    expect(version.equals(Version.create('v1.2.3'))).toBe(true);
    expect(Version.optional(undefined)).toBeNull();
    expect(Version.optional('stable')?.toString()).toBe('stable');
    expect(() => Version.create('1.0.0;rm')).toThrow('Invalid version');
  });
});
