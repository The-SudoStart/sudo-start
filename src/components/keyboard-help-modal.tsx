'use client';

import { X, Command, CornerDownLeft, ArrowUp, ArrowDown, Delete, Keyboard } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useFocusTrap, getModifierSymbol, isMac } from '@/hooks/use-keyboard-shortcuts';

interface KeyboardHelpModalProps {
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

export function KeyboardHelpModal({ onClose }: KeyboardHelpModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const isMacOS = isMac();
  const mod = getModifierSymbol();

  useFocusTrap(modalRef, true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: 'Global Shortcuts',
      shortcuts: [
        { keys: [`${mod}K`], description: 'Open search' },
        { keys: [`${mod}B`], description: 'Toggle bucket modal' },
        { keys: [`${mod}↵`], description: 'Generate script (when bucket has items)' },
        { keys: [`${mod}⇧C`], description: 'Copy current script' },
        { keys: ['?'], description: 'Show this help modal' },
        { keys: ['Esc'], description: 'Close current modal/panel' },
      ],
    },
    {
      title: 'Navigation Shortcuts',
      shortcuts: [
        { keys: ['Tab'], description: 'Navigate between focusable elements' },
        { keys: ['⇧Tab'], description: 'Navigate backwards' },
        { keys: ['↑', '↓'], description: 'Navigate packages in search results' },
        { keys: ['↵'], description: 'Select focused package / Add to bucket' },
        { keys: ['1-9'], description: 'Quick select category (1=All, 2=IDEs, etc.)' },
      ],
    },
    {
      title: 'Bucket Shortcuts',
      shortcuts: [
        { keys: ['Del', '⌫'], description: 'Remove focused item from bucket' },
        { keys: ['↑', '↓'], description: 'Navigate items in bucket' },
        { keys: ['↵'], description: 'Generate script from bucket' },
      ],
    },
    {
      title: 'Chat Shortcuts',
      shortcuts: [
        { keys: [`${mod}⇧A`], description: 'Toggle AI chat' },
        { keys: ['Esc'], description: 'Close chat (when focused)' },
        { keys: ['↵'], description: 'Send message' },
        { keys: ['⇧↵'], description: 'New line in message' },
      ],
    },
  ];

  const renderKey = (key: string) => {
    // Handle special keys
    if (key === 'Esc') return <span className="px-2 py-1">Esc</span>;
    if (key === 'Del') return <Delete className="w-3 h-3" />;
    if (key === '⌫') return <span className="px-2 py-1">⌫</span>;
    if (key === '↵') return <CornerDownLeft className="w-3 h-3" />;
    if (key === '⇧') return <span className="px-1">⇧</span>;
    if (key === '↑') return <ArrowUp className="w-3 h-3" />;
    if (key === '↓') return <ArrowDown className="w-3 h-3" />;
    if (key === mod) return <Command className="w-3 h-3" />;
    if (key === '1-9') return <span className="px-2 py-1">1-9</span>;
    if (key === '?') return <span className="px-2 py-1">?</span>;
    if (key === 'Tab') return <span className="px-2 py-1">Tab</span>;
    
    return <span className="px-1.5 py-0.5">{key}</span>;
  };

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl terminal-card rounded-xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-help-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Keyboard className="w-5 h-5 terminal-text" />
            </div>
            <div>
              <h2 id="keyboard-help-title" className="text-lg font-bold terminal-text">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-muted-foreground">
                Master the keyboard to work faster
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Close keyboard shortcuts help"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/30 transition-colors"
                  >
                    <span className="text-sm text-foreground">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <span key={keyIdx}>
                          <kbd className="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-1.5 rounded border border-border bg-muted text-xs font-mono">
                            {renderKey(key)}
                          </kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="mx-1 text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Platform note */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              <span className="terminal-text font-medium">Tip:</span> Shortcuts use{' '}
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-xs font-mono">
                {isMacOS ? '⌘' : 'Ctrl'}
              </kbd>{' '}
              as the primary modifier key on your platform.
            </p>
          </div>

          {/* Accessibility note */}
          <div className="p-4 rounded-lg bg-accent/30 border border-border">
            <p className="text-sm text-muted-foreground">
              <span className="terminal-text font-medium">Accessibility:</span> All interactive elements
              are keyboard accessible. Use{' '}
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-xs font-mono">Tab</kbd>{' '}
              to navigate and{' '}
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-xs font-mono">↵</kbd>{' '}
              to activate.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card/50 flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>Press <kbd className="px-1.5 py-0.5 rounded border border-border">Esc</kbd> to close</span>
          <span>SudoStart Keyboard Navigation</span>
        </div>
      </div>
    </div>
  );
}
