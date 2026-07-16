'use client';

import { useStore } from '@/lib/store';
import { appCatalog, getAppsForOS } from '@/lib/apps';
import { Package } from '@/types';
import { Search, X, Plus, Check, SearchX } from 'lucide-react';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useFocusTrap, useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { getCategoryMeta } from '@/lib/categories';

interface SearchBarProps {
  onClose: () => void;
}

export function SearchBar({ onClose }: SearchBarProps) {
  const { os, bucket, addToBucket, removeFromBucket } = useStore();
  const [query, setQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const availableApps = useMemo(() => {
    if (!os) return appCatalog;
    return getAppsForOS(os);
  }, [os]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Focus trap for modal
  useFocusTrap(containerRef, true);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return availableApps
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, availableApps]);

  // Suggestions when no query
  const suggestions = useMemo(() => {
    if (query.trim()) return [];
    const popular = ['git', 'vscode', 'nodejs', 'docker', 'python3', 'rust', 'cursor', 'zsh'];
    return availableApps.filter((p) => popular.includes(p.id)).slice(0, 6);
  }, [query, availableApps]);

  const isInBucket = useCallback((pkg: Package) => bucket.some((p) => p.id === pkg.id), [bucket]);

  const handleToggle = useCallback((pkg: Package) => {
    if (isInBucket(pkg)) {
      removeFromBucket(pkg.id);
    } else {
      addToBucket({ ...pkg, selectedVersion: pkg.defaultVersion });
    }
  }, [isInBucket, removeFromBucket, addToBucket]);

  const displayItems = query.trim() ? results : suggestions;
  const showingSuggestions = !query.trim();

  // Navigate results with arrow keys
  const navigateResults = useCallback((direction: 'up' | 'down') => {
    if (displayItems.length === 0) return;
    
    setFocusedIndex((prev) => {
      let next: number;
      if (direction === 'down') {
        next = prev < displayItems.length - 1 ? prev + 1 : 0;
      } else {
        next = prev > 0 ? prev - 1 : displayItems.length - 1;
      }
      // Focus the item
      setTimeout(() => {
        itemRefs.current[next]?.focus();
      }, 0);
      return next;
    });
  }, [displayItems.length]);

  // Select focused item
  const selectFocusedItem = useCallback(() => {
    if (focusedIndex >= 0 && focusedIndex < displayItems.length) {
      handleToggle(displayItems[focusedIndex]);
    }
  }, [focusedIndex, displayItems, handleToggle]);

  // Keyboard shortcuts for search
  const searchShortcuts = [
    {
      key: 'ArrowDown',
      description: 'Navigate down in results',
      action: () => navigateResults('down'),
    },
    {
      key: 'ArrowUp',
      description: 'Navigate up in results',
      action: () => navigateResults('up'),
    },
    {
      key: 'Enter',
      description: 'Select focused item',
      action: selectFocusedItem,
    },
    {
      key: 'Escape',
      description: 'Close search',
      action: onClose,
      preventDefault: false,
    },
  ];

  useKeyboardShortcuts(searchShortcuts, true);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-24"
      style={{ background: 'color-mix(in oklch, var(--foreground) 35%, transparent)', backdropFilter: 'blur(6px)' }}>
      <div
        ref={containerRef}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-popover shadow-soft-lg"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-primary" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search packages, tools, runtimes..."
            className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-flex py-1 text-xs rounded border border-border text-muted-foreground font-mono">ESC</kbd>
            <button
              onClick={onClose}
              className="p-1 hover:bg-accent rounded transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              title="Close search (Esc)"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results / Suggestions */}
        <div className="max-h-[320px] overflow-y-auto">
          {displayItems.length > 0 && (
            <div>
              <div className="border-b border-border/60 px-4 py-2 text-xs font-medium text-muted-foreground">
                {showingSuggestions ? 'Popular packages' : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
              </div>
              <ul role="listbox" aria-label="Search results">
                {displayItems.map((pkg, index) => {
                  const inBucket = isInBucket(pkg);
                  const isFocused = focusedIndex === index;
                  return (
                    <li key={pkg.id} role="option" aria-selected={inBucket}>
                      <button
                        ref={(el) => { itemRefs.current[index] = el; }}
                        onClick={() => handleToggle(pkg)}
                        onFocus={() => setFocusedIndex(index)}
                        className={`w-full flex items-center gap-3 px-4 py-2 transition-colors text-left group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                          isFocused ? 'bg-accent/50 ring-2 ring-ring' : 'hover:bg-accent/50'
                        }`}
                        aria-label={`${pkg.name} - ${inBucket ? 'In bucket, press Enter to remove' : 'Press Enter to add to bucket'}`}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg app-icon-tile text-sm font-bold">
                          {pkg.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{pkg.name}</span>
                            <span className="hidden rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground sm:inline">
                              {getCategoryMeta(pkg.category).label}
                            </span>
                          </div>
                          <p className="truncate text-sm text-muted-foreground">{pkg.description}</p>
                        </div>
                        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          inBucket
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted group-hover:bg-primary/20 group-hover:text-primary'
                        }`}>
                          {inBucket ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {query.trim() && results.length === 0 && (
            <div className="px-4 py-12 text-center text-muted-foreground">
              <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl app-icon-tile">
                <SearchX className="h-6 w-6" />
              </span>
              <p className="font-medium text-foreground">No packages found for &quot;{query}&quot;</p>
              <p className="mt-1 text-sm">Try searching by category or tool name</p>
            </div>
          )}

          {!query.trim() && suggestions.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              Start typing to search packages…
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-border bg-card/50 flex items-center gap-4 text-xs text-muted-foreground font-mono">
          <span><kbd className="px-1.5 py-0.5 rounded border border-border">↵</kbd> to add/remove</span>
          <span><kbd className="px-1.5 py-0.5 rounded border border-border">ESC</kbd> to close</span>
          <span className="ml-auto">{bucket.length} in bucket</span>
        </div>
      </div>
    </div>
  );
}
