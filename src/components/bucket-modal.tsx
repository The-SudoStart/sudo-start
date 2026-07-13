'use client';

import { useStore } from '@/lib/store';
import { X, Trash2, Package } from 'lucide-react';
import { VersionNote } from './version-note';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useFocusTrap, useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { EmptyBucketState } from './empty-state';
import { appCatalog } from '@/lib/apps';
import { PresetsModal } from './presets-modal';

interface BucketModalProps {
  onClose: () => void;
}

export function BucketModal({ onClose }: BucketModalProps) {
  const { bucket, removeFromBucket, clearBucket, setCurrentStep, updatePackageNote, addDefaultAppsToBucket, addToBucket } = useStore();
  const { toast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [showPresets, setShowPresets] = useState(false);

  // Popular packages for quick-add
  const popularPackages = useMemo(() => {
    const popularIds = ['git', 'nodejs', 'docker', 'vscode', 'zsh'];
    return popularIds
      .map(id => appCatalog.find(p => p.id === id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined)
      .slice(0, 3);
  }, []);

  const handleAddDefaults = useCallback(() => {
    addDefaultAppsToBucket();
    toast.success('⚡ Added recommended tools');
  }, [addDefaultAppsToBucket, toast]);

  const handleBrowseCatalog = useCallback(() => {
    onClose();
    setCurrentStep('catalog');
  }, [onClose, setCurrentStep]);

  const handleOpenPresets = useCallback(() => {
    setShowPresets(true);
  }, []);

  // Focus trap for modal
  useFocusTrap(modalRef, true);

  const handleRemoveFromBucket = (pkgId: string, pkgName: string) => {
    removeFromBucket(pkgId);
    toast.success(`🗑️ Removed ${pkgName}`);
  };

  const handleClearBucket = () => {
    clearBucket();
    toast.info('🧹 Bucket cleared');
  };

  const handleGenerateScript = () => {
    if (bucket.length === 0) {
      toast.info('Add packages to bucket first');
      return;
    }
    onClose();
    setCurrentStep('output');
    toast.success('🚀 Script generated');
  };

  // Navigate bucket items with arrow keys
  const navigateItems = useCallback((direction: 'up' | 'down') => {
    if (bucket.length === 0) return;
    
    setFocusedIndex((prev) => {
      let next: number;
      if (direction === 'down') {
        next = prev < bucket.length - 1 ? prev + 1 : 0;
      } else {
        next = prev > 0 ? prev - 1 : bucket.length - 1;
      }
      // Focus the item
      setTimeout(() => {
        itemRefs.current[next]?.focus();
      }, 0);
      return next;
    });
  }, [bucket.length]);

  // Remove focused item
  const removeFocusedItem = useCallback(() => {
    if (focusedIndex >= 0 && focusedIndex < bucket.length) {
      const pkg = bucket[focusedIndex];
      removeFromBucket(pkg.id);
      toast.success(`🗑️ Removed ${pkg.name}`);
      // Adjust focus index
      if (focusedIndex >= bucket.length - 1) {
        setFocusedIndex(Math.max(0, bucket.length - 2));
      }
    }
  }, [focusedIndex, bucket, removeFromBucket, toast]);

  // Keyboard shortcuts for bucket
  const bucketShortcuts = [
    {
      key: 'ArrowDown',
      description: 'Navigate down in bucket',
      action: () => navigateItems('down'),
    },
    {
      key: 'ArrowUp',
      description: 'Navigate up in bucket',
      action: () => navigateItems('up'),
    },
    {
      key: 'Delete',
      description: 'Remove focused item',
      action: removeFocusedItem,
    },
    {
      key: 'Backspace',
      description: 'Remove focused item',
      action: removeFocusedItem,
    },
    {
      key: 'Enter',
      description: 'Generate script',
      action: handleGenerateScript,
    },
    {
      key: 'Escape',
      description: 'Close bucket modal',
      action: onClose,
      preventDefault: false,
    },
  ];

  useKeyboardShortcuts(bucketShortcuts, true);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
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
          <button
            type="button"
            title="Close (Esc)"
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="Close bucket modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {bucket.length === 0 ? (
            <EmptyBucketState
              onAddDefaults={handleAddDefaults}
              onBrowseCatalog={handleBrowseCatalog}
              onOpenPresets={handleOpenPresets}
              popularPackages={popularPackages.map(pkg => ({
                id: pkg.id,
                name: pkg.name,
                onAdd: () => {
                  addToBucket({ ...pkg, selectedVersion: pkg.defaultVersion });
                  toast.success(`✅ Added ${pkg.name}`);
                },
              }))}
            />
          ) : (
            <ul className="divide-y divide-border" role="list" aria-label="Bucket items">
              {bucket.map((pkg, index) => {
                const v = pkg.selectedVersion || pkg.defaultVersion;
                const isGeneric = ['stable', 'latest'].includes(v);
                const versionLabel = isGeneric ? 'Stable' : v.startsWith('v') ? v : 'v' + v;
                const isFocused = focusedIndex === index;

                return (
                  <li
                    key={pkg.id}
                    ref={(el) => { itemRefs.current[index] = el; }}
                    tabIndex={isFocused ? 0 : -1}
                    className={`p-3 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                      isFocused ? 'bg-accent/50 ring-2 ring-ring' : 'hover:bg-accent/30'
                    }`}
                    onFocus={() => setFocusedIndex(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Delete' || e.key === 'Backspace') {
                        e.preventDefault();
                        handleRemoveFromBucket(pkg.id, pkg.name);
                        // Adjust focus
                        if (index >= bucket.length - 1) {
                          setFocusedIndex(Math.max(0, bucket.length - 2));
                        }
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        handleGenerateScript();
                      }
                    }}
                    role="listitem"
                    aria-label={`${pkg.name} version ${versionLabel}`}
                  >
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
                        onClick={() => handleRemoveFromBucket(pkg.id, pkg.name)}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors shrink-0 mt-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        title="Remove from bucket (Delete)"
                        aria-label={`Remove ${pkg.name} from bucket`}
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
                    font-medium hover:bg-primary/90 transition-all terminal-glow focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-keyshortcuts="Enter"
              >
                Generate Script →
              </button>
              <button
                onClick={handleClearBucket}
                className="w-full py-2 px-4 rounded-lg border border-destructive text-destructive
                    hover:bg-destructive/10 transition-all text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Presets Modal */}
      {showPresets && (
        <PresetsModal onClose={() => setShowPresets(false)} />
      )}
    </>
  );
}