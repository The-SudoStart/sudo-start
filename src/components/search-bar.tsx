'use client';

import { useStore } from '@/lib/store';
import { appCatalog, getAppsForOS } from '@/lib/apps';
import { Package } from '@/types';
import { Search, X, Plus, Check, SearchX, Sparkles, Loader2, Globe } from 'lucide-react';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useFocusTrap, useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { getCategoryMeta } from '@/lib/categories';
import { AppIcon } from './app-icon';

interface SearchBarProps {
  onClose: () => void;
}

export function SearchBar({ onClose }: SearchBarProps) {
  const { os, bucket, addToBucket, removeFromBucket } = useStore();
  const [query, setQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [externalResults, setExternalResults] = useState<Package[]>([]);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const availableApps = useMemo(() => {
    if (!os) return appCatalog;
    return getAppsForOS(os);
  }, [os]);

  const registriesForOS = useMemo(() => {
    const regs: string[] = ['npm', 'pypi'];
    if (os === 'macos') regs.push('homebrew');
    if (os === 'linux') regs.push('apt');
    return regs;
  }, [os]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useFocusTrap(containerRef, true);

  const localResults = useMemo(() => {
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
      .slice(0, 12);
  }, [query, availableApps]);

  useEffect(() => {
    if (!query.trim()) {
      setExternalResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsSearchingExternal(true);
      try {
        const promises = registriesForOS.map((reg) =>
          fetch(`/api/registry?q=${encodeURIComponent(query)}&registry=${reg}&limit=10`)
            .then((r) => r.json())
            .then((d) => d.packages || [])
            .catch(() => [])
        );
        const allResults = await Promise.all(promises);
        const merged = allResults.flat();
        const seen = new Set(localResults.map((p) => p.name.toLowerCase()));
        const filtered = merged.filter((p: Package) => {
          const name = p.name.toLowerCase();
          if (seen.has(name)) return false;
          seen.add(name);
          return true;
        });
        setExternalResults(filtered);
      } catch {
        setExternalResults([]);
      } finally {
        setIsSearchingExternal(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, registriesForOS, localResults]);

  const suggestions = useMemo(() => {
    if (query.trim()) return [];
    const popular = ['git', 'vscode', 'nodejs', 'docker', 'python3', 'rust', 'cursor', 'zsh', 'go', 'bun', 'vim', 'firefox'];
    return availableApps.filter((p) => popular.includes(p.id)).slice(0, 8);
  }, [query, availableApps]);

  const isInBucket = useCallback((pkg: Package) => bucket.some((p) => p.id === pkg.id), [bucket]);

  const handleToggle = useCallback((pkg: Package) => {
    if (isInBucket(pkg)) {
      removeFromBucket(pkg.id);
    } else {
      addToBucket({ ...pkg, selectedVersion: pkg.defaultVersion });
    }
  }, [isInBucket, removeFromBucket, addToBucket]);

  const displayItems = query.trim() ? [...localResults, ...externalResults] : suggestions;
  const showingSuggestions = !query.trim();

  const navigateResults = useCallback((direction: 'up' | 'down') => {
    if (displayItems.length === 0) return;
    setFocusedIndex((prev) => {
      let next: number;
      if (direction === 'down') {
        next = prev < displayItems.length - 1 ? prev + 1 : 0;
      } else {
        next = prev > 0 ? prev - 1 : displayItems.length - 1;
      }
      setTimeout(() => {
        itemRefs.current[next]?.focus();
      }, 0);
      return next;
    });
  }, [displayItems.length]);

  const selectFocusedItem = useCallback(() => {
    if (focusedIndex >= 0 && focusedIndex < displayItems.length) {
      handleToggle(displayItems[focusedIndex]);
    }
  }, [focusedIndex, displayItems, handleToggle]);

  const searchShortcuts = [
    { key: 'ArrowDown', description: 'Navigate down in results', action: () => navigateResults('down') },
    { key: 'ArrowUp', description: 'Navigate up in results', action: () => navigateResults('up') },
    { key: 'Enter', description: 'Select focused item', action: selectFocusedItem },
    { key: 'Escape', description: 'Close search', action: onClose, preventDefault: false },
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

  const getRegistryBadge = (pkg: Package) => {
    if (pkg.id.startsWith('brew-')) return { label: 'Homebrew', color: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400' };
    if (pkg.id.startsWith('npm-')) return { label: 'npm', color: 'bg-red-500/15 text-red-700 dark:text-red-400' };
    if (pkg.id.startsWith('pypi-')) return { label: 'PyPI', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' };
    if (pkg.id.startsWith('apt-')) return { label: 'APT', color: 'bg-green-500/15 text-green-700 dark:text-green-400' };
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[10vh]"
      style={{ background: 'color-mix(in oklch, var(--foreground) 40%, transparent)', backdropFilter: 'blur(8px)' }}>
      <div
        ref={containerRef}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl"
        style={{ animation: 'searchSlideIn 0.2s ease-out' }}
      >
        <style>{`
          @keyframes searchSlideIn {
            from { opacity: 0; transform: translateY(-12px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setFocusedIndex(-1); }}
            placeholder="Search all packages..."
            className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-accent rounded-md transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex py-1 px-2 text-[11px] rounded-md border border-border bg-muted text-muted-foreground font-mono">ESC</kbd>
        </div>

        <div className="max-h-[650px] overflow-y-auto scrollbar-clean">
          {isSearchingExternal && displayItems.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          )}

          {displayItems.length > 0 && (
            <div>
              <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border/60 bg-popover/95 px-5 py-2.5 backdrop-blur-sm">
                {showingSuggestions ? (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Popular tools</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {displayItems.length} result{displayItems.length !== 1 ? 's' : ''}
                    </span>
                    {query && (
                      <span className="text-xs text-muted-foreground/60">for &ldquo;{query}&rdquo;</span>
                    )}
                    {isSearchingExternal && (
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    )}
                  </>
                )}
              </div>
              <ul role="listbox" aria-label="Search results" className="py-1">
                {displayItems.map((pkg, index) => {
                  const inBucket = isInBucket(pkg);
                  const isFocused = focusedIndex === index;
                  const catMeta = getCategoryMeta(pkg.category);
                  const regBadge = getRegistryBadge(pkg);
                  return (
                    <li key={pkg.id} role="option" aria-selected={inBucket}>
                      <button
                        ref={(el) => { itemRefs.current[index] = el; }}
                        onClick={() => handleToggle(pkg)}
                        onFocus={() => setFocusedIndex(index)}
                        className={`w-full flex items-center gap-3.5 px-5 py-3 transition-all text-left group ${
                          isFocused ? 'bg-accent' : 'hover:bg-accent/50'
                        }`}
                        aria-label={`${pkg.name} - ${inBucket ? 'In bucket, press Enter to remove' : 'Press Enter to add to bucket'}`}
                      >
                        <AppIcon id={pkg.id} name={pkg.name} size={40} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{pkg.name}</span>
                            {regBadge && (
                              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${regBadge.color}`}>
                                {regBadge.label}
                              </span>
                            )}
                            <span className="hidden rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex items-center gap-1">
                              <catMeta.icon className="h-2.5 w-2.5" />
                              {catMeta.label}
                            </span>
                          </div>
                          <p className="truncate text-xs text-muted-foreground mt-0.5">{pkg.description}</p>
                        </div>
                        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          inBucket
                            ? 'bg-primary/15 text-primary'
                            : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary'
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

          {!isSearchingExternal && query.trim() && displayItems.length === 0 && (
            <div className="px-5 py-16 text-center text-muted-foreground">
              <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <SearchX className="h-7 w-7 text-muted-foreground/60" />
              </span>
              <p className="font-semibold text-foreground">No results for &ldquo;{query}&rdquo;</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different search term</p>
            </div>
          )}

          {!query.trim() && suggestions.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              Start typing to search...
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-border bg-muted/30 px-5 py-2.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded border border-border bg-background font-mono">↵</kbd> toggle</span>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded border border-border bg-background font-mono">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded border border-border bg-background font-mono">ESC</kbd> close</span>
          <span className="ml-auto font-medium">{bucket.length} in bucket</span>
        </div>
      </div>
    </div>
  );
}
