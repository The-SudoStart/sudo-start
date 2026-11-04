'use client';

import { useMemo, useState } from 'react';
import { BrandMark } from './brand-mark';

/**
 * A "ROOT ACCESS" badge that drops in on a lanyard when the script page opens,
 * then sways. Click it to swing it again. The barcode is derived from the
 * selected tool ids, so each setup gets its own.
 */
export function RootAccessBadge({ os, shell, toolIds }: { os: 'macos' | 'linux' | null; shell: string; toolIds: string[] }) {
  // Bumping the key remounts the rig, which replays the drop.
  const [swing, setSwing] = useState(0);

  const granted = useMemo(
    () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    [],
  );

  const bars = useMemo(() => {
    const seed = toolIds.join('|') || 'sudostart';
    return Array.from({ length: 34 }, (_, i) => {
      const code = seed.charCodeAt(i % seed.length) + i * 7;
      return { width: 1 + (code % 3), gap: 1 + ((code >> 2) % 2) };
    });
  }, [toolIds]);

  return (
    <div key={swing} className="badge-rig relative flex w-[200px] flex-col items-center">
      {/* Lanyard strap: reaches up past the top of the page */}
      <div className="lanyard-strap h-[96px] w-[22px]" aria-hidden="true" />
      <button
        type="button"
        onClick={() => setSwing((n) => n + 1)}
        className="group relative -mt-1 flex flex-col items-center focus-visible:outline-none"
        aria-label={`Root access badge for ${toolIds.length} ${toolIds.length === 1 ? 'tool' : 'tools'} on ${os === 'linux' ? 'Linux' : 'macOS'}. Click to swing it.`}
      >
        {/* Metal clip */}
        <span className="relative z-10 h-[18px] w-[34px] rounded-[5px] border-2 border-line-strong bg-muted" aria-hidden="true" />
        <span className="badge-card -mt-2 w-[200px] overflow-hidden rounded-[14px] border border-border bg-card text-left shadow-[var(--shadow-3)] group-focus-visible:ring-2 group-focus-visible:ring-ring">
          <span className="mx-auto mt-3 block h-[7px] w-[46px] rounded-full bg-background shadow-inner" aria-hidden="true" />
          <span className="mt-3 flex items-center gap-2 bg-primary px-4 py-2.5 text-primary-foreground">
            <BrandMark size={20} wordmark={false} tone="inverse" />
            <span className="label-caps">Root access</span>
          </span>
          <span className="grid grid-cols-2 gap-x-3 gap-y-2.5 px-4 pb-3 pt-3.5">
            <BadgeField label="Holder" value="You" />
            <BadgeField label="Platform" value={os === 'linux' ? 'Linux' : 'macOS'} />
            <BadgeField label="Tools" value={String(toolIds.length)} />
            <BadgeField label="Shell" value={shell} />
            <BadgeField label="Granted" value={granted} wide />
          </span>
          <span className="flex h-9 items-end gap-0 border-t border-dashed border-border px-4 pb-2.5 pt-2" aria-hidden="true">
            {bars.map((bar, i) => (
              <span key={i} className="h-full bg-foreground" style={{ width: bar.width, marginRight: bar.gap }} />
            ))}
          </span>
          <span className="block bg-muted px-4 py-1.5 font-mono text-[10.5px] text-muted-foreground">
            <span className="text-primary">#</span> sudo -v <span className="text-[var(--ok)]">✓ valid</span>
          </span>
        </span>
      </button>
    </div>
  );
}

function BadgeField({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <span className={`block min-w-0 ${wide ? 'col-span-2' : ''}`}>
      <span className="block font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">{label}</span>
      <span className="block truncate font-display text-[14px] font-bold text-card-foreground">{value}</span>
    </span>
  );
}
