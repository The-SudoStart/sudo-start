import { ShareScriptInput, ShareScriptOutput } from '../dto/share-script.dto';
import { ScriptSharePort } from '../ports/outgoing/script-share.port';

export class ShareScriptUseCase {
  constructor(private readonly scriptShare: ScriptSharePort) {}

  async execute(input: ShareScriptInput): Promise<ShareScriptOutput> {
    if (!input.script || typeof input.script !== 'string') {
      throw new Error('Invalid script');
    }

    if (input.script.length > 1024 * 1024) {
      throw new Error('Script too large (max 1MB)');
    }

    const id = await this.scriptShare.create({
      script: input.script,
      meta: {
        os: input.os ?? 'unknown',
        packages: input.packages ?? [],
      },
    });

    return { id };
  }
}
