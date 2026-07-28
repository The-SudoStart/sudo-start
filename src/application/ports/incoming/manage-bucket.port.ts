import { Package } from '@/types';

export interface ManageBucketPort {
  addPackage(pkg: Package): Promise<Package[]>;
  removePackage(packageId: string): Promise<Package[]>;
  clear(): Promise<Package[]>;
  getContents(): Promise<Package[]>;
}
