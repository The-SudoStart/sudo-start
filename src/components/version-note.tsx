'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { StickyNote, X, Check, PenLine } from 'lucide-react';

interface VersionNoteProps {
  pkgId: string;
  pkgName: string;
  version: string;
  note: string;
  onSave: (pkgId: string, note: string) => void;
  /** Compact = icon-only trigger (for package cards). Full = expanded inline (for bucket list). */
  variant?: 'compact' | 'inline';
}

export function VersionNote({ pkgId, pkgName, version, note, onSave, variant = 'compact' }: VersionNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync draft when note prop changes (e.g. import) - defer to avoid sync setState
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDraft((prev) => (prev !== note ? note : prev));
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [note]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(draft.length, draft.length);
    }
  }, [isEditing, draft.length]);

  const handleSave = useCallback(() => {
    onSave(pkgId, draft.trim());
    setIsEditing(false);
  }, [pkgId, draft, onSave]);

  const handleClear = () => {
    setDraft('');
    onSave(pkgId, '');
    setIsEditing(false);
  };

  // Close on outside click
  useEffect(() => {
    if (!isEditing) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleSave();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isEditing, draft, handleSave]);

  const hasNote = note.trim().length > 0;
  const isGeneric = ['stable', 'latest'].includes(version);
  const versionLabel = isGeneric ? '' : version.startsWith('v') ? version : `v${version}`;

  if (variant === 'inline') {
    return (
      <div ref={containerRef} className="mt-2">
        {isEditing ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--note-text)' }}>
              <StickyNote className="w-3 h-3" />
              <span className="font-medium">Pin note{versionLabel ? ` for ${versionLabel}` : ''}</span>
            </div>
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave();
                if (e.key === 'Escape') { setDraft(note); setIsEditing(false); }
              }}
              placeholder="e.g. Pinned to avoid breaking change in v3.x — review after Q2"
              rows={2}
              className="version-note-input"
            />
            <div className="flex gap-1.5">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                  bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                <Check className="w-3 h-3" />
                Save
              </button>
              {hasNote && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs
                    border border-destructive text-destructive hover:bg-destructive/10 transition-all"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
              <button
                onClick={() => { setDraft(note); setIsEditing(false); }}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs
                  border border-border text-muted-foreground hover:bg-accent transition-all ml-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : hasNote ? (
          <button
            onClick={() => setIsEditing(true)}
            className="version-note-badge group w-full text-left hover:opacity-80 transition-opacity"
            title="Click to edit note"
          >
            <StickyNote className="w-3 h-3 shrink-0" />
            <span className="truncate flex-1">{note}</span>
            <PenLine className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground
              transition-colors py-0.5"
          >
            <StickyNote className="w-3 h-3" />
            <span>Add pin note…</span>
          </button>
        )}
      </div>
    );
  }

  // compact variant — icon button that opens a floating popover
  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsEditing(!isEditing)}
        title={hasNote ? `Note: ${note}` : 'Add version pin note'}
        className={`p-1.5 rounded transition-all ${
          hasNote
            ? 'text-yellow-500 hover:bg-yellow-500/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }`}
      >
        <StickyNote className="w-3.5 h-3.5" />
      </button>

      {isEditing && (
        <div
          className="absolute right-0 top-full mt-1 z-50 w-72 rounded-xl border border-border
            bg-card shadow-2xl p-4 space-y-3"
          style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--note-text)' }}>
              <StickyNote className="w-3.5 h-3.5" />
              <span>{pkgName}{versionLabel ? ` · ${versionLabel}` : ''}</span>
            </div>
            <button
              type="button"
              title="Close"
              onClick={() => { setDraft(note); setIsEditing(false); }}
              className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave();
              if (e.key === 'Escape') { setDraft(note); setIsEditing(false); }
            }}
            placeholder="Why this version? e.g. Pinned — v18 required by legacy AWS Lambda runtime"
            rows={3}
            className="version-note-input"
          />
          <p className="text-xs text-muted-foreground">⌘↵ to save · Esc to cancel</p>

          <div className="flex gap-1.5">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg
                bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              Save Note
            </button>
            {hasNote && (
              <button
                onClick={handleClear}
                className="px-3 py-1.5 rounded-lg border border-destructive text-destructive
                  text-xs hover:bg-destructive/10 transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}