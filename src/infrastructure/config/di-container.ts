import { ChatWithAIUseCase } from '@/application/use-cases/chat-with-ai.use-case';
import { FetchVersionsUseCase } from '@/application/use-cases/fetch-versions.use-case';
import { GenerateScriptUseCase } from '@/application/use-cases/generate-script.use-case';
import { ShareScriptUseCase } from '@/application/use-cases/share-script.use-case';
import { ParseAIActionUseCase } from '@/application/use-cases/parse-ai-action.use-case';
import { GroqAdapter } from '../adapters/ai/groq.adapter';
import { HttpVersionRepository } from '../adapters/registries/http-version.repository';
import { FileScriptShareAdapter } from '../adapters/sharing/file-script-share.adapter';
import { staticPackageRepository } from '../adapters/catalog/static-package.repository';

const versionRepository = new HttpVersionRepository();
const scriptShareAdapter = new FileScriptShareAdapter();

export const container = {
  generateScriptUseCase: new GenerateScriptUseCase(),
  chatWithAIUseCase: new ChatWithAIUseCase(new GroqAdapter()),
  fetchVersionsUseCase: new FetchVersionsUseCase(versionRepository),
  shareScriptUseCase: new ShareScriptUseCase(scriptShareAdapter),
  scriptShareAdapter,
  versionRepository,
  packageRepository: staticPackageRepository,
  parseAIActionUseCase: new ParseAIActionUseCase(staticPackageRepository),
};
