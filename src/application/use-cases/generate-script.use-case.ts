import { Script } from '@/domain/entities/script';
import { PackageEntity } from '@/domain/entities/package';
import { Platform } from '@/domain/value-objects/platform';
import { Shell } from '@/domain/value-objects/shell';
import { generateScript } from '@/domain/services/script-generator';
import { GenerateScriptInput, GenerateScriptOutput } from '../dto/generate-script.dto';
import { GenerateScriptPort } from '../ports/incoming/generate-script.port';

export class GenerateScriptUseCase implements GenerateScriptPort {
  async execute(input: GenerateScriptInput): Promise<GenerateScriptOutput> {
    return this.executeSync(input);
  }

  executeSync(input: GenerateScriptInput): GenerateScriptOutput {
    const platform = Platform.create(input.platform);
    const shell = Shell.create(input.shell);
    const packages = input.packages.map((pkg) => PackageEntity.fromDTO(pkg));
    const content = generateScript(input.platform, input.shell, input.packages);
    const script = new Script({ content, packages, targetPlatform: platform, shell });

    return { script: script.toString() };
  }
}
