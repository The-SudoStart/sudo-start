'use client';

import { useEffect, useCallback, useRef } from 'react';

export interface ShortcutConfig {
  [key: string]: () => void;
}

export interface ShortcutDefinition {
  key: string;
  modifiers?: {
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
  };
  description: string;
  action: () => void;
  preventDefault?: boolean;
}

/**
 * Hook for managing keyboard shortcuts
 * Supports both simple key combinations and complex modifier combinations
 */
export function useKeyboardShortcuts(
  shortcuts: ShortcutDefinition[],
  enabled: boolean = true
) {
  const shortcutsRef = useRef(shortcuts);
  
  // Keep ref up to date
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    for (const shortcut of shortcutsRef.current) {
      const { key, modifiers = {}, action, preventDefault = true } = shortcut;
      
      // Check if key matches (case insensitive for letters)
      const keyMatches = e.key.toLowerCase() === key.toLowerCase();
      
      // Check modifiers
      const ctrlMatches = modifiers.ctrl === undefined || e.ctrlKey === modifiers.ctrl;
      const metaMatches = modifiers.meta === undefined || e.metaKey === modifiers.meta;
      const shiftMatches = modifiers.shift === undefined || e.shiftKey === modifiers.shift;
      const altMatches = modifiers.alt === undefined || e.altKey === modifiers.alt;
      
      // Special handling for Cmd/Ctrl - treat them as equivalent
      const isCmdOrCtrl = (e.metaKey || e.ctrlKey) && (modifiers.ctrl || modifiers.meta);
      const cmdMatches = isCmdOrCtrl || (ctrlMatches && metaMatches);
      
      if (keyMatches && cmdMatches && shiftMatches && altMatches) {
        if (preventDefault) {
          e.preventDefault();
        }
        action();
        break;
      }
    }
  }, [enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Hook for focus management within a container
 * Implements focus trap for modals and restores focus on close
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  isActive: boolean
) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the first focusable element in the container
      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    } else if (previousFocusRef.current) {
      // Restore focus when deactivated
      previousFocusRef.current.focus();
    }
  }, [isActive, containerRef]);

  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (!isActive || !containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [isActive, containerRef]);

  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [isActive, handleTabKey]);
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  
  const selectors = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]',
  ].join(', ');

  return Array.from(container.querySelectorAll(selectors)).filter(
    (el) => {
      // Filter out hidden elements
      const element = el as HTMLElement;
      return element.offsetParent !== null && !element.hasAttribute('disabled');
    }
  ) as HTMLElement[];
}

/**
 * Hook for arrow key navigation in lists
 */
export function useArrowKeyNavigation(
  itemCount: number,
  onSelect: (index: number) => void,
  enabled: boolean = true
) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (itemCount === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev < itemCount - 1 ? prev + 1 : 0;
            return next;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev > 0 ? prev - 1 : itemCount - 1;
            return next;
          });
          break;
        case 'Enter':
          if (focusedIndex >= 0 && focusedIndex < itemCount) {
            e.preventDefault();
            onSelect(focusedIndex);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, itemCount, focusedIndex, onSelect]);

  return { focusedIndex, setFocusedIndex };
}

import { useState } from 'react';

/**
 * Format shortcut for display (e.g., "⌘K" or "Ctrl+K")
 */
export function formatShortcut(key: string, isMac: boolean = false): string {
  const modifier = isMac ? '⌘' : 'Ctrl';
  return `${modifier}${key}`;
}

/**
 * Check if user is on Mac
 */
export function isMac(): boolean {
  if (typeof navigator === 'undefined') return false;
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

/**
 * Get the appropriate modifier key symbol for the current platform
 */
export function getModifierSymbol(): string {
  return isMac() ? '⌘' : 'Ctrl';
}

/**
 * Get the full modifier key name for the current platform
 */
export function getModifierKey(): string {
  return isMac() ? 'Cmd' : 'Ctrl';
}
