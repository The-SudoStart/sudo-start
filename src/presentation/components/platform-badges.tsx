import { Package } from '@/types';
import { Apple, Monitor } from 'lucide-react';

interface PlatformBadgesProps {
  pkg: Package;
}

export function PlatformBadges({ pkg }: PlatformBadgesProps) {
  return (
    <div className="flex items-center gap-1.5">
      {pkg.platforms.macos && (
        <span
          title="Available on macOS"
          className="flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
        >
          <Apple className="h-3 w-3" /> macOS
        </span>
      )}
      {pkg.platforms.linux && (
        <span
          title="Available on Linux"
          className="flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
        >
          <Monitor className="h-3 w-3" /> Linux
        </span>
      )}
    </div>
  );
}
