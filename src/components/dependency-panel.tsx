'use client';

import { Package } from '@/types';
import { dependencyWarnings, pairSuggestions } from '@/lib/suggestions';
import { appCatalog } from '@/lib/apps';
import { useStore } from '@/lib/store';
import { AlertTriangle, Lightbulb, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState } from 'react';

interface DependencyPanelProps {
  bucket: Package[];
  os: 'macos' | 'linux' | null;
}

export function DependencyPanel({ bucket, os }: DependencyPanelProps) {
  const { addToBucket } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const bucketIds = useMemo(() => new Set(bucket.map((p) => p.id)), [bucket]);

  const warnings = useMemo(() => {
    return dependencyWarnings.filter(
      (w) => bucketIds.has(w.if) && !bucketIds.has(w.needs)
    );
  }, [bucketIds]);

  const suggestions = useMemo(() => {
    const seen = new Set<string>();
    const result: { triggeredBy: string; suggestedId: string }[] = [];

    bucket.forEach((pkg) => {
      const pairs = pairSuggestions[pkg.id] ?? [];
      pairs.forEach((sugId) => {
        if (!bucketIds.has(sugId) && !seen.has(sugId)) {
          const sugPkg = appCatalog.find((p) => p.id === sugId);
          if (sugPkg && (!os || sugPkg.platforms[os])) {
            seen.add(sugId);
            result.push({ triggeredBy: pkg.name, suggestedId: sugId });
          }
        }
      });
    });

    return result.slice(0, 4);
  }, [bucket, bucketIds, os]);

  if (warnings.length === 0 && suggestions.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card/50 overflow-hidden">
      {/* Compact header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {warnings.length > 0 && (
            <span className="flex items-center gap-1 text-yellow-500">
              <AlertTriangle className="w-3 h-3" />
              {warnings.length} warning{warnings.length > 1 ? 's' : ''}
            </span>
          )}
          {suggestions.length > 0 && (
            <span className="flex items-center gap-1 text-primary">
              <Lightbulb className="w-3 h-3" />
              {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span className="text-muted-foreground flex items-center gap-1">
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-border/50">
          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="pt-2 space-y-1.5">
              {warnings.map((w, i) => {
                const needsPkg = appCatalog.find((p) => p.id === w.needs);
                return (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {w.message}
                    </span>
                    {needsPkg && (
                      <button
                        onClick={() => addToBucket({ ...needsPkg, selectedVersion: needsPkg.defaultVersion })}
                        className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-yellow-500/10
                          text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20 transition-colors"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className={`space-y-1.5 ${warnings.length > 0 ? 'pt-2 border-t border-border/30' : 'pt-2'}`}>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map(({ triggeredBy, suggestedId }) => {
                  const pkg = appCatalog.find((p) => p.id === suggestedId);
                  if (!pkg) return null;
                  return (
                    <button
                      key={suggestedId}
                      onClick={() => addToBucket({ ...pkg, selectedVersion: pkg.defaultVersion })}
                      className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] bg-primary/10
                        text-primary hover:bg-primary/20 transition-colors"
                      title={`Suggested via ${triggeredBy}`}
                    >
                      <Plus className="w-2.5 h-2.5" />
                      {pkg.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
