'use client';

import { useStore } from '@/lib/store';
import { presets } from '@/lib/presets';
import { appCatalog } from '@/lib/apps';
import { X, Clock, Layers, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { estimateInstallTime } from '@/lib/script-generator';
import { Package } from '@/types';

interface PresetsModalProps {
  onClose: () => void;
}

export function PresetsModal({ onClose }: PresetsModalProps) {
  const { loadPreset, bucket, os } = useStore();
  const [applied, setApplied] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleApply = (presetId: string, packageIds: string[]) => {
    loadPreset(packageIds);
    setApplied(presetId);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          ref={modalRef}
          className="w-full max-w-3xl terminal-card rounded-xl overflow-hidden shadow-2xl"
          style={{ boxShadow: '0 0 60px rgba(0,255,128,0.15)' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border bg-card">
            <div>
              <h2 className="text-xl font-bold terminal-text">Starter Presets</h2>
              <p className="text-sm text-muted-foreground mt-0.5">One-click environment configurations</p>
            </div>
            <button type="button" title="Close" aria-label="Close" onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grid */}
          <div className="p-5 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presets.map((preset) => {
                const pkgs = preset.packageIds
                  .map((id) => appCatalog.find((p) => p.id === id))
                  .filter(Boolean) as Package[];

                const available = os
                  ? pkgs.filter((p) => p.platforms[os])
                  : pkgs;

                const alreadyHave = available.filter((p) =>
                  bucket.some((b) => b.id === p.id)
                ).length;

                const estTime = estimateInstallTime(available);
                const isApplied = applied === preset.id;

                return (
                  <button
                    type="button"
                    key={preset.id}
                    onClick={() => handleApply(preset.id, preset.packageIds)}
                    disabled={isApplied}
                    className={`text-left p-4 rounded-lg border-2 transition-all group ${
                      isApplied
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/60 hover:bg-accent/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{preset.emoji}</span>
                        <div>
                          <p className="font-bold terminal-text text-sm">{preset.name}</p>
                          <p className="text-xs text-muted-foreground">{preset.description}</p>
                        </div>
                      </div>
                      {isApplied && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {preset.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded border border-border text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {available.length} packages
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ~{estTime} min
                      </span>
                      {alreadyHave > 0 && (
                        <span className="terminal-text">
                          {alreadyHave} already in bucket
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t border-border bg-card/50 text-xs text-muted-foreground font-mono">
            Presets add packages to your existing bucket — nothing is removed.
          </div>
        </div>
      </div>
    </>
  );
}