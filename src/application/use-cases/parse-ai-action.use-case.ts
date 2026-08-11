import { PackageRepository } from '@/domain/repositories/package-repository.interface';
import { isValidPackageId, isValidVersion } from '@/lib/security';
import { ParsedAIResponse } from '../dto/ai-action.dto';

export class ParseAIActionUseCase {
  constructor(private readonly packageRepository: PackageRepository) {}

  async execute(fullContent: string): Promise<ParsedAIResponse> {
    try {
      const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return { text: fullContent, action: null, executed: false };

      const parsed = JSON.parse(jsonMatch[0]);
      const text = parsed.response ?? fullContent;
      const action = parsed.action;

      if (!action?.packageIds || !Array.isArray(action.packageIds)) {
        return { text, action: null, executed: true };
      }

      if (action.type !== 'add' && action.type !== 'remove') {
        return { text, action: null, executed: true };
      }

      const packages = [];
      for (const idWithVersion of action.packageIds) {
        if (typeof idWithVersion !== 'string') continue;

        const [id, versionId] = idWithVersion.split(':');
        if (!isValidPackageId(id)) {
          console.warn(`[Security] Rejected invalid package ID from AI: ${id}`);
          continue;
        }

        if (versionId && !isValidVersion(versionId)) {
          console.warn(`[Security] Rejected invalid version ID from AI: ${versionId}`);
          continue;
        }

        const pkg = await this.packageRepository.findById(id);
        if (!pkg) {
          console.warn(`[Security] Rejected unknown package ID from AI: ${id}`);
          continue;
        }
        packages.push({ pkg: pkg.toDTO(), versionId });
      }

      return {
        text,
        action: { type: action.type, packages },
        executed: true,
      };
    } catch {
      return { text: fullContent, action: null, executed: false };
    }
  }
}
