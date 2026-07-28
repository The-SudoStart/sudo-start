import { describe, expect, it } from 'vitest';
import { Bucket } from './bucket';
import { PackageEntity } from './package';

function makePackage(id: string): PackageEntity {
  return new PackageEntity({
    id,
    name: id,
    description: id,
    category: 'tool',
    platforms: { macos: true, linux: true },
    defaultVersion: 'stable',
    installCommands: [
      {
        version: 'stable',
        label: 'Stable',
        macos: `brew install ${id}`,
        linux: `sudo apt-get install -y ${id}`,
      },
    ],
  });
}

describe('Bucket', () => {
  it('adds packages immutably and prevents duplicates', () => {
    const empty = new Bucket();
    const withGit = empty.add(makePackage('git'));
    const duplicate = withGit.add(makePackage('git'));

    expect(empty.getItems()).toHaveLength(0);
    expect(withGit.getItems()).toHaveLength(1);
    expect(duplicate.getItems()).toHaveLength(1);
  });

  it('removes and clears packages immutably', () => {
    const bucket = new Bucket([makePackage('git'), makePackage('curl')]);

    expect(bucket.remove('git').getItems().map((item) => item.id)).toEqual(['curl']);
    expect(bucket.clear().getItems()).toHaveLength(0);
    expect(bucket.getItems()).toHaveLength(2);
  });
});
