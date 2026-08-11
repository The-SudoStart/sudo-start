import { Package } from '@/types';
import { generateBrewfile } from '@/domain/services/script-generator';

export class GenerateBrewfileUseCase {
  execute(packages: Package[]): string {
    return generateBrewfile(packages);
  }
}
