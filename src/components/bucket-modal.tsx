'use client';

import { useStore } from '@/lib/store';
import { X, Trash2, Package } from 'lucide-react';
import { VersionNote } from './version-note';
import { useEffect, useRef } from 'react';

interface BucketModalProps {
  onClose: () => void;
}

export function BucketModal({ onClose }: BucketModalProps) {
  const { bucket, removeFromBucket, clearBucket, setCurrentStep, updatePackageNote } = useStore();
  const modalRef = useRef<HTMLDivElement>(null);

  const handleGenerateScript = () => {
    onClose();
    setCurrentStep('output');
  };

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

  return (
    <>
      {/* Modal */}
      <div 
        ref={modalRef}
        className="absolute right-0 top-full mt-2 w-88 max-h-[520px]
          terminal-card rounded-lg shadow-2xl z-50 border border-border flex flex-col"
        style={{ width: '22rem' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 terminal-text" />
            <span className="font-bold">Your Bucket</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 terminal-text">
              {bucket.length}
            </span>
          </div>
          <button type="button" title="Close"
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {bucket.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Your bucket is empty</p>
              <p className="text-sm mt-1">Add some tools to get started!</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {bucket.map((pkg) => {
                const v = pkg.selectedVersion || pkg.defaultVersion;
                const isGeneric = ['stable', 'latest'].includes(v);
                const versionLabel = isGeneric ? 'Stable' : v.startsWith('v') ? v : 'v' + v;

                return (
                  <li key={pkg.id} className="p-3 hover:bg-accent/30 transition-colors">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{pkg.name}</p>
                        <p className="text-xs text-muted-foreground">{versionLabel}</p>

                        {/* Inline note editor */}
                        <VersionNote
                          pkgId={pkg.id}
                          pkgName={pkg.name}
                          version={v}
                          note={pkg.versionNote || ''}
                          onSave={updatePackageNote}
                          variant="inline"
                        />
                      </div>
                      <button
                        onClick={() => removeFromBucket(pkg.id)}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors shrink-0 mt-0.5"
                        title="Remove from bucket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-card space-y-2">
          {bucket.length > 0 && (
            <>
              <button
                onClick={handleGenerateScript}
                className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground
                    font-medium hover:bg-primary/90 transition-all terminal-glow"
              >
                Generate Script →
              </button>
              <button
                onClick={clearBucket}
                className="w-full py-2 px-4 rounded-lg border border-destructive text-destructive
                    hover:bg-destructive/10 transition-all text-sm"
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}