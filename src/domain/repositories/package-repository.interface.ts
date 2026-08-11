import { Category } from '@/types';
import { PackageEntity } from '../entities/package';

export interface PackageRepository {
  findById(id: string): Promise<PackageEntity | null>;
  findByCategory(category: Category): Promise<PackageEntity[]>;
  search(query: string): Promise<PackageEntity[]>;
}
