import { Package } from '@/types';
import { estimateDiskSpace, estimateInstallTime } from '@/domain/services/script-generator';

export class GetInstallEstimatesUseCase {
  execute(packages: Package[]): { estimatedMinutes: number; estimatedDiskMb: number; diskLabel: string } {
    const estimatedMinutes = estimateInstallTime(packages);
    const estimatedDiskMb = estimateDiskSpace(packages);
    const diskLabel = estimatedDiskMb >= 1000
      ? `${(estimatedDiskMb / 1000).toFixed(1)} GB`
      : `${estimatedDiskMb} MB`;

    return { estimatedMinutes, estimatedDiskMb, diskLabel };
  }
}
