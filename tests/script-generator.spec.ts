import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { appCatalog } from '../src/lib/apps';
import { generateBrewfile, generateScript } from '../src/lib/script-generator';
import type { Package } from '../src/types';

const fixture: Package = {
  id: 'fixture', name: 'Fixture', description: 'Test package', category: 'tool',
  platforms: { linux: true, macos: true }, defaultVersion: 'stable',
  versions: [{ id: 'stable', label: 'Stable', macCommand: 'true', linuxCommand: 'true' }],
};

test('multiline imported notes stay comments in both output formats', () => {
  const pkg = { ...fixture, versionNote: 'review\nprintf INJECTED\r\nprintf SECOND' };
  const script = generateScript('linux', 'bash', [pkg]);
  const brewfile = generateBrewfile([{
    ...pkg,
    versions: [{ id: 'stable', label: 'Stable', macCommand: 'brew install fixture', linuxCommand: 'true' }],
  }]);
  for (const output of [script, brewfile]) {
    for (const line of output.split('\n').filter((line) => line.includes('INJECTED') || line.includes('SECOND'))) {
      expect(line.trimStart()).toMatch(/^#/);
    }
  }
});

test('version templates resolve minor placeholders', () => {
  for (const id of ['ruby', 'php']) {
    const pkg = appCatalog.find((item) => item.id === id);
    expect(pkg).toBeDefined();
    const script = generateScript('linux', 'bash', [{ ...pkg!, selectedVersion: '8.3' }]);
    expect(script).not.toContain('${VERSION_MINOR}');
    expect(script).toContain(id === 'ruby' ? 'ruby8.3' : 'php8.3-cli');
  }
});

test('unsupported incomplete versions are skipped instead of emitting placeholders', () => {
  const pkg = appCatalog.find((item) => item.id === 'ruby')!;
  const script = generateScript('linux', 'bash', [{ ...pkg, selectedVersion: '8' }]);
  expect(script).toContain('Ruby is not available on LINUX');
  expect(script).not.toContain('${VERSION_MINOR}');
});

test('generated installer exits on failure and reports success only after success', () => {
  const probe = spawnSync('bash', ['-c', 'true'], { timeout: 1000 });
  test.skip(probe.status !== 0, 'Shell subprocesses are unavailable in this sandbox');
  const script = generateScript('linux', 'bash', [fixture]);
  expect(spawnSync('bash', ['-n'], { input: script, timeout: 3000 }).status).toBe(0);
  const start = script.indexOf('run_install() {');
  const end = script.indexOf('\n}', start) + 2;
  const runInstall = script.slice(start, end);
  for (const verbose of ['true', 'false']) {
    for (const command of ['true', 'false']) {
      const harness = `set -e\n${runInstall}\nspinner() { wait "$1"; }\nlog() { :; }\nok() { echo OK; }\nerr() { echo ERROR >&2; }\nVERBOSE=${verbose}\nrun_install Fixture ${command}\necho END`;
      const result = spawnSync('bash', ['-c', harness], { encoding: 'utf8', timeout: 5000 });
      expect(result.status).toBe(command === 'true' ? 0 : 1);
      expect(result.stdout.includes('OK')).toBe(command === 'true');
      expect(result.stdout.includes('END')).toBe(command === 'true');
      expect(result.stderr.includes('ERROR')).toBe(command === 'false');
    }
  }
});
