import { ParseAIActionUseCase } from '@/application/use-cases/parse-ai-action.use-case';
import { FetchVersionsUseCase } from '@/application/use-cases/fetch-versions.use-case';
import { GenerateScriptUseCase } from '@/application/use-cases/generate-script.use-case';
import { GenerateBrewfileUseCase } from '@/application/use-cases/generate-brewfile.use-case';
import { GetInstallEstimatesUseCase } from '@/application/use-cases/get-install-estimates.use-case';
import { GetPackageVersionsUseCase } from '@/application/use-cases/get-package-versions.use-case';
import { GetPackagesForPlatformUseCase } from '@/application/use-cases/get-packages-for-platform.use-case';
import { GetPreviewCommandUseCase } from '@/application/use-cases/get-preview-command.use-case';
import { SearchPackagesUseCase } from '@/application/use-cases/search-packages.use-case';
import { ManageBucketUseCase } from '@/application/use-cases/manage-bucket.use-case';
import { staticPackageRepository } from '../adapters/catalog/static-package.repository';
import { BrowserVersionRepository } from '../adapters/registries/browser-version.repository';
import { LocalStorageAdapter } from '../adapters/storage/local-storage.adapter';
import { Package } from '@/types';

const browserVersionRepository = new BrowserVersionRepository();
const fetchVersionsUseCase = new FetchVersionsUseCase(browserVersionRepository);

export const clientContainer = {
  packageRepository: staticPackageRepository,
  manageBucketUseCase: new ManageBucketUseCase(
    new LocalStorageAdapter<Package[]>('sudostart-bucket-use-case-storage'),
    staticPackageRepository,
  ),
  generateScriptUseCase: new GenerateScriptUseCase(),
  generateBrewfileUseCase: new GenerateBrewfileUseCase(),
  fetchVersionsUseCase,
  getInstallEstimatesUseCase: new GetInstallEstimatesUseCase(),
  getPackageVersionsUseCase: new GetPackageVersionsUseCase(fetchVersionsUseCase),
  getPackagesForPlatformUseCase: new GetPackagesForPlatformUseCase(staticPackageRepository),
  getPreviewCommandUseCase: new GetPreviewCommandUseCase(),
  searchPackagesUseCase: new SearchPackagesUseCase(staticPackageRepository),
  parseAIActionUseCase: new ParseAIActionUseCase(staticPackageRepository),
};
