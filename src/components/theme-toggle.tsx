'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

/** Light/dark switch for page headers; the new theme wipes in from the click. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
