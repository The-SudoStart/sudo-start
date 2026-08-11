'use client';

import { useMemo } from 'react';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { getCategoryMeta } from '@/lib/categories';

interface CategoryFilterProps {
  categories: string[];
  categoryCounts: Record<string, number>;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryFilter({
  categories,
  categoryCounts,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  // Category keyboard shortcuts (1-9)
  const categoryShortcuts = useMemo(() => {
    const shortcuts = [];
    for (let i = 0; i < Math.min(categories.length, 9); i++) {
      const category = categories[i];
      const key = (i + 1).toString();
      shortcuts.push({
        key,
        description: `Select category: ${category}`,
        action: () => onSelectCategory(category),
      });
    }
    return shortcuts;
  }, [categories, onSelectCategory]);

  // Apply category shortcuts
  useKeyboardShortcuts(categoryShortcuts, true);

  return (
    <div className="sticky top-[68px] z-30 -mx-4 border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat, index) => {
          const meta = getCategoryMeta(cat);
          const Icon = meta.icon;
          const shortcutNumber = index < 9 ? index + 1 : null;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-soft'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
              aria-pressed={isSelected}
              aria-keyshortcuts={shortcutNumber ? shortcutNumber.toString() : undefined}
              title={`${meta.label}${shortcutNumber ? ` (${shortcutNumber})` : ''}`}
            >
              <Icon className="h-4 w-4" />
              <span>{meta.label}</span>
              <span
                className={`ml-0.5 rounded-full px-1.5 text-[11px] tabular-nums ${
                  isSelected ? 'bg-primary-foreground/20' : 'bg-muted'
                }`}
              >
                {categoryCounts[cat] ?? 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
