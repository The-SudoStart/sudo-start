'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

type Theme = 'dark' | 'light';

/** Where the switch was triggered from; the new theme wipes in from there. */
type ToggleOrigin = { clientX: number; clientY: number };

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: (origin?: ToggleOrigin) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sudostart-theme') as Theme | null;
      if (stored === 'light' || stored === 'dark') return stored;
      // Respect the OS preference, defaulting to the clean light theme.
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('sudostart-theme', theme);
  }, [theme]);

  const toggleTheme = (origin?: ToggleOrigin) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) {
      setTheme(next);
      return;
    }

    // Keyboard clicks report 0,0; start from the top centre instead.
    const hasPoint = origin && (origin.clientX || origin.clientY);
    const x = hasPoint ? origin.clientX : window.innerWidth / 2;
    const y = hasPoint ? origin.clientY : 0;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(() => {
      // The attribute is set here, not only in the effect, so the new
      // snapshot is taken with the new theme applied.
      flushSync(() => setTheme(next));
      document.documentElement.setAttribute('data-theme', next);
    });
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 520, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
