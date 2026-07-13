'use client';

import { useState, useRef, useEffect } from 'react';
import { Info, X, Copy, Check, Terminal } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CommandPreviewProps {
  command: string;
  packageName: string;
  os: 'macos' | 'linux' | null;
  version?: string;
}

export function CommandPreview({ command, packageName, os, version }: CommandPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Keyboard shortcut: 'i' key to open preview when focused
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'i' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeElement = document.activeElement;
        if (containerRef.current?.contains(activeElement)) {
          e.preventDefault();
          setIsOpen(true);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleCopy = async () => {
    if (!command) return;
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const osLabel = os === 'macos' ? 'macOS' : os === 'linux' ? 'Linux' : 'Unknown OS';
  const isGeneric = version && ['stable', 'latest'].includes(version);
  const versionLabel = version && !isGeneric ? ` @ ${version.startsWith('v') ? version : `v${version}`}` : '';

  return (
    <div ref={containerRef} className="relative">
      {/* Info/Preview Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={`Preview install command (press 'i')`}
        className={`p-1.5 rounded transition-all ${
          isOpen
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }`}
      >
        <Info className="w-4 h-4" />
      </button>

      {/* Preview Modal/Tooltip */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-xl border border-border
            bg-card shadow-2xl overflow-hidden"
          style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                {packageName}{versionLabel}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-accent text-muted-foreground">
                {osLabel}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                title="Close (Esc)"
                className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Command Display */}
          <div className="p-4 space-y-3">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span>Install Command:</span>
            </div>

            {command ? (
              <div className="relative group">
                <div className="rounded-lg overflow-hidden border border-border">
                  <SyntaxHighlighter
                    language="bash"
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: '12px 16px',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      background: '#1e1e1e',
                      borderRadius: '0.5rem',
                    }}
                    wrapLines={true}
                    wrapLongLines={true}
                  >
                    {command}
                  </SyntaxHighlighter>
                </div>

                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  title={copied ? 'Copied!' : 'Copy to clipboard'}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-background/90 
                    border border-border/50 text-muted-foreground hover:text-foreground
                    hover:bg-background transition-all opacity-0 group-hover:opacity-100
                    focus:opacity-100"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No install command available for this OS
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                Press <kbd className="px-1.5 py-0.5 rounded bg-accent text-xs">i</kbd> to toggle
              </span>
              <div className="flex gap-2">
                {command && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                      bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium
                    border border-border hover:bg-accent transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
