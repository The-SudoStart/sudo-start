'use client';

import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/theme-context';
import { MessageSquare, ShoppingCart, Terminal, Search, Layers, Upload, Download as DownloadIcon, Sun, Moon, MoreHorizontal, Monitor, Apple, ChevronDown } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { BucketModal } from './bucket-modal';
import { SearchBar } from './search-bar';
import { PresetsModal } from './presets-modal';
import { useToast } from '@/hooks/use-toast';
import { useKeyboardShortcuts, getModifierSymbol } from '@/hooks/use-keyboard-shortcuts';
import { copyToClipboard } from '@/lib/utils';

export function Navbar() {
  const { os, bucket, toggleChat, exportBucket, importBucket, setCurrentStep, generatedScript, setOS } = useStore();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [isBucketOpen, setIsBucketOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOSSwitcherOpen, setIsOSSwitcherOpen] = useState(false);
  const [importError, setImportError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const osSwitcherRef = useRef<HTMLDivElement>(null);
  const modSymbol = getModifierSymbol();

  // Handle OS switch
  const handleOSSwitch = (newOS: 'macos' | 'linux') => {
    if (newOS === os) {
      setIsOSSwitcherOpen(false);
      return;
    }
    setOS(newOS);
    toast.success(`🖥️ Switched to ${newOS === 'macos' ? 'MacOS' : 'Linux'}`);
    setIsOSSwitcherOpen(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const success = importBucket(ev.target?.result as string);
      if (success) {
        toast.success('📂 Configuration imported successfully');
        setImportError(false);
      } else {
        setImportError(true);
        toast.error('❌ Failed to import configuration');
        setTimeout(() => setImportError(false), 3000);
      }
    };
    reader.onerror = () => {
      toast.error('❌ Failed to read file');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExport = () => {
    exportBucket();
    toast.success('💾 Configuration exported');
  };

  // Copy script to clipboard
  const handleCopyScript = useCallback(async () => {
    if (!generatedScript) {
      toast.error('No script to copy');
      return;
    }
    const success = await copyToClipboard(generatedScript);
    if (success) {
      toast.success('📋 Script copied to clipboard');
    } else {
      toast.error('❌ Failed to copy script');
    }
  }, [generatedScript, toast]);

  // Generate script from bucket
  const handleGenerateScript = useCallback(() => {
    if (bucket.length === 0) {
      toast.info('Add packages to bucket first');
      return;
    }
    setIsBucketOpen(false);
    setCurrentStep('output');
    toast.success('🚀 Script generated');
  }, [bucket.length, setCurrentStep, toast]);

  // Define keyboard shortcuts
  const shortcuts = [
    // Global shortcuts
    {
      key: 'k',
      modifiers: { meta: true },
      description: 'Open search',
      action: () => setIsSearchOpen(true),
    },
    {
      key: 'b',
      modifiers: { meta: true },
      description: 'Toggle bucket',
      action: () => setIsBucketOpen(prev => !prev),
    },
    {
      key: 'Enter',
      modifiers: { meta: true },
      description: 'Generate script',
      action: handleGenerateScript,
    },
    {
      key: 'c',
      modifiers: { meta: true, shift: true },
      description: 'Copy script',
      action: handleCopyScript,
    },
    {
      key: 'a',
      modifiers: { meta: true, shift: true },
      description: 'Toggle AI chat',
      action: toggleChat,
    },
    {
      key: 'Escape',
      description: 'Close modals',
      action: () => {
        setIsSearchOpen(false);
        setIsBucketOpen(false);
        setIsPresetsOpen(false);
        setIsMenuOpen(false);
      },
      preventDefault: false,
    },
  ];

  // Apply keyboard shortcuts
  useKeyboardShortcuts(shortcuts, true);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      if (osSwitcherRef.current && !osSwitcherRef.current.contains(e.target as Node)) {
        setIsOSSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {isSearchOpen && <SearchBar onClose={() => setIsSearchOpen(false)} />}
      {isPresetsOpen && <PresetsModal onClose={() => setIsPresetsOpen(false)} />}

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
        title="Import presets file"
        aria-label="Import presets file"
      />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <Terminal className="w-7 h-7 terminal-text" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold terminal-text leading-tight">SudoStart</h1>
                <p className="text-xs text-muted-foreground leading-tight">
                  {os?.toUpperCase() ?? 'Package'} Manager
                </p>
              </div>
            </div>

            {/* OS Switcher */}
            {os && (
              <div className="relative" ref={osSwitcherRef}>
                <button
                  type="button"
                  onClick={() => setIsOSSwitcherOpen(!isOSSwitcherOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border
                    hover:border-primary/50 transition-all text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  title="Switch operating system"
                  aria-label="Switch operating system"
                >
                  {os === 'macos' ? (
                    <Apple className="w-4 h-4" />
                  ) : (
                    <Monitor className="w-4 h-4" />
                  )}
                  <span className="hidden md:inline capitalize">{os}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isOSSwitcherOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOSSwitcherOpen && (
                  <div className="absolute left-0 top-full mt-2 w-40 py-2 rounded-lg border border-border bg-card shadow-xl z-50">
                    <button
                      type="button"
                      onClick={() => handleOSSwitch('macos')}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors text-left ${
                        os === 'macos' ? 'bg-primary/10 text-primary' : ''
                      }`}
                    >
                      <Apple className="w-4 h-4" />
                      <span>MacOS</span>
                      {os === 'macos' && <span className="ml-auto text-xs">✓</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOSSwitch('linux')}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors text-left ${
                        os === 'linux' ? 'bg-primary/10 text-primary' : ''
                      }`}
                    >
                      <Monitor className="w-4 h-4" />
                      <span>Linux</span>
                      {os === 'linux' && <span className="ml-auto text-xs">✓</span>}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Search Bar (desktop) */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex flex-1 max-w-md items-center gap-3 px-4 py-2 rounded-lg bg-muted border border-border hover:border-primary/50 transition-all text-muted-foreground text-sm font-mono focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-keyshortcuts="Meta+K"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span>Search packages...</span>
              <kbd className="ml-auto px-1.5 py-0.5 text-xs rounded border border-border">{modSymbol}K</kbd>
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search (mobile) */}
              <button
                type="button"
                title="Search packages"
                aria-label="Search packages"
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden p-2 rounded-lg border border-border hover:border-primary/50 transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Presets */}
              <button
                type="button"
                onClick={() => setIsPresetsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border
                  hover:border-primary/50 transition-all text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                title="Starter presets"
              >
                <Layers className="w-4 h-4" />
                <span className="hidden lg:inline">Presets</span>
              </button>

              {/* More Menu (Import/Export) */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                    importError
                      ? 'border-destructive text-destructive'
                      : 'border-border hover:border-primary/50'
                  }`}
                  title="More options"
                  aria-label="More options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                  <span className="hidden lg:inline">More</span>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 py-2 rounded-lg border border-border bg-card shadow-xl z-50">
                    <button
                      type="button"
                      onClick={() => {
                        fileInputRef.current?.click();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors text-left"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Import</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleExport();
                        setIsMenuOpen(false);
                      }}
                      disabled={bucket.length === 0}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-border hover:border-primary/50 transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-yellow-400" />
                ) : (
                  <Moon className="w-4 h-4 terminal-text" />
                )}
              </button>

              {/* Bucket */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsBucketOpen(!isBucketOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-border
                    hover:border-primary/50 transition-all terminal-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-keyshortcuts="Meta+B"
                  title={`Bucket (${modSymbol}B)`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Bucket</span>
                  {bucket.length > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary
                      text-primary-foreground text-xs font-bold flex items-center justify-center terminal-glow">
                      {bucket.length}
                    </span>
                  )}
                </button>
                {isBucketOpen && <BucketModal onClose={() => setIsBucketOpen(false)} />}
              </div>

              {/* AI Chat */}
              <button
                type="button"
                onClick={toggleChat}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-primary
                  terminal-text hover:terminal-glow transition-all text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-keyshortcuts="Meta+Shift+A"
                title={`Root AI (${modSymbol}⇧A)`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Root AI</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="h-[60px]" />
    </>
  );
}