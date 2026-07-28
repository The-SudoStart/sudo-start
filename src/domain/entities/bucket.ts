import { PackageEntity } from './package';

export class Bucket {
  readonly createdAt: Date;
  readonly updatedAt: Date;
  private readonly items: readonly PackageEntity[];

  constructor(items: PackageEntity[] = [], createdAt = new Date(), updatedAt = new Date()) {
    this.items = [...items];
    this.createdAt = new Date(createdAt);
    this.updatedAt = new Date(updatedAt);
  }

  add(pkg: PackageEntity): Bucket {
    if (this.items.some((item) => item.id === pkg.id)) {
      return this;
    }

    return new Bucket([...this.items, pkg], this.createdAt, new Date());
  }

  remove(packageId: string): Bucket {
    return new Bucket(
      this.items.filter((item) => item.id !== packageId),
      this.createdAt,
      new Date(),
    );
  }

  clear(): Bucket {
    return new Bucket([], this.createdAt, new Date());
  }

  getItems(): PackageEntity[] {
    return [...this.items];
  }
}
