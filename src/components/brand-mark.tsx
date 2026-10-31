import { Terminal } from 'lucide-react';

/**
 * SudoStart logo: a tinted tile holding the terminal icon, next to the
 * "SudoStart" wordmark.
 */
export function BrandMark({
  size = 36,
  wordmark = true,
  tone = 'default',
  className = '',
}: {
  size?: number;
  wordmark?: boolean;
  /** `inverse` is a white tile with a BIOS Blue icon, for use on a BIOS Blue fill. */
  tone?: 'default' | 'inverse';
  className?: string;
}) {
  const tile = (
    <span
      className={`flex shrink-0 items-center justify-center ${
        tone === 'inverse'
          ? 'bg-primary-foreground text-primary'
          : 'app-icon-tile border border-primary/20'
      }`}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.3) }}
      aria-hidden="true"
    >
      <Terminal style={{ width: size * 0.55, height: size * 0.55 }} />
    </span>
  );

  if (!wordmark) {
    return (
      <span className={`inline-flex ${className}`} role="img" aria-label="SudoStart">
        {tile}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 text-foreground ${className}`}>
      {tile}
      <span className="font-bold tracking-tight" style={{ fontSize: Math.max(14, Math.round(size * 0.45)) }}>
        SudoStart
      </span>
    </span>
  );
}
