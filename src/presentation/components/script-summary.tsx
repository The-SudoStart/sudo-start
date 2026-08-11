'use client';

import { Package } from '@/types';
import { Clock, HardDrive, StickyNote } from 'lucide-react';
import { ScriptExplanation } from '@/components/script-explanation';
import { InstallEstimate } from '@/application/use-cases/get-install-estimates.use-case';
import { useState } from 'react';

interface ScriptSummaryProps {
  bucket: Package[];
  os: 'macos' | 'linux' | null;
  shell: 'bash' | 'zsh' | 'fish' | null;
  script: string;
  estimates: InstallEstimate;
}

export function ScriptSummary({ bucket, os, shell, script, estimates }: ScriptSummaryProps) {
  const [showAllNotes, setShowAllNotes] = useState(false);
  const { estimatedMinutes: estTime, diskLabel } = estimates;
  const pinnedPackages = bucket.filter((p) => p.versionNote?.trim());

  return (
    <div className="terminal-card rounded-lg p-4 sm:p-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-2xl font-bold terminal-text">{bucket.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Packages</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-2xl font-bold terminal-text capitalize">{os}</p>
          <p className="text-xs text-muted-foreground mt-0.5">OS</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/50 flex flex-col items-center">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 terminal-text" />
            <p className="text-2xl font-bold terminal-text">~{estTime}m</p>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Install time</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/50 flex flex-col items-center">
          <div className="flex items-center gap-1">
            <HardDrive className="w-4 h-4 terminal-text" />
            <p className="text-2xl font-bold terminal-text">~{diskLabel}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Disk space</p>
        </div>
      </div>

      {/* Package chips */}
      <div className="flex flex-wrap gap-2">
        {bucket.map((pkg) => {
          const v = pkg.selectedVersion || pkg.defaultVersion;
          const isGeneric = ['stable', 'latest', 'fnm', 'deb', 'appimage'].includes(v);
          const hasNote = pkg.versionNote?.trim();
          return (
            <span
              key={pkg.id}
              className={`px-2 py-1 rounded-lg text-xs font-mono flex items-center gap-1 ${
                hasNote
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-primary/15 text-primary'
              }`}
              title={hasNote ? `📌 ${pkg.versionNote}` : undefined}
            >
              {hasNote && <StickyNote className="w-2.5 h-2.5 text-yellow-500" />}
              {pkg.name}{!isGeneric ? ` ${v.startsWith('v') ? v : 'v' + v}` : ''}
            </span>
          );
        })}
      </div>

      {/* Version pin notes summary */}
      {pinnedPackages.length > 0 && (
        <div className="mt-4 rounded-lg border p-3 space-y-2"
          style={{ background: 'var(--note-bg)', borderColor: 'var(--note-border)' }}>
          <button
            onClick={() => setShowAllNotes(!showAllNotes)}
            className="flex items-center gap-2 text-xs font-medium w-full text-left"
            style={{ color: 'var(--note-text)' }}
          >
            <StickyNote className="w-3.5 h-3.5 text-yellow-500" />
            <span>{pinnedPackages.length} pinned version{pinnedPackages.length > 1 ? 's' : ''} with notes</span>
            <span className="ml-auto opacity-60">{showAllNotes ? '▲ hide' : '▼ show'}</span>
          </button>
          {showAllNotes && (
            <ul className="space-y-1.5 pt-1 border-t" style={{ borderColor: 'var(--note-border)' }}>
              {pinnedPackages.map((pkg) => {
                const v = pkg.selectedVersion || pkg.defaultVersion;
                const isGeneric = ['stable', 'latest'].includes(v);
                const vLabel = isGeneric ? 'stable' : v.startsWith('v') ? v : `v${v}`;
                return (
                  <li key={pkg.id} className="flex gap-2 text-xs" style={{ color: 'var(--note-text)' }}>
                    <span className="font-mono font-medium shrink-0">{pkg.name} @ {vLabel}</span>
                    <span className="opacity-70 truncate">— {pkg.versionNote}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Script Explanation */}
      <div className="mt-4">
        <ScriptExplanation
          script={script}
          packages={bucket}
          os={os}
          shell={shell}
        />
      </div>
    </div>
  );
}
