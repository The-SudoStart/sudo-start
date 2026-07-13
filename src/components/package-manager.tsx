'use client';

import { useStore } from '@/lib/store';
import { appCatalog, getAppsForOS } from '@/lib/apps';
import { Package } from '@/types';
import { Plus, Check, ChevronDown, AlertCircle, Wand2, Copy, Clock, HardDrive, Terminal } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './navbar';
import { DependencyPanel } from './dependency-panel';
import { VersionNote } from './version-note';
import { estimateInstallTime, estimateDiskSpace } from '@/lib/script-generator';
import { useToast } from '@/hooks/use-toast';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { copyToClipboard } from '@/lib/utils';

const categoryIcons: Record<string, string> = {
  all: '🗂️', ide: '📝', browser: '🌐', tool: '🔧', runtime: '⚙️',
  container: '📦', database: '💾', terminal: '💻', framework: '🧱',
  devops: '♾️', 'data-science': '🧪', mobile: '📱', 'game-dev': '🎮',
  'desktop-dev': '🖥️', 'web-server': '🌍', 'package-manager': '📌',
  'build-tool': '🔨', cloud: '☁️', utility: '🛠️', communication: '💬',
  productivity: '🚀',
};

export function PackageManager() {
  const { os, bucket, addToBucket, updatePackageVersion, updatePackageNote, addDefaultAppsToBucket, setCurrentStep } = useStore();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [focusedPackageIndex, setFocusedPackageIndex] = useState<number>(-1);
  const packageGridRef = useRef<HTMLDivElement>(null);

  const availableApps = useMemo(() => {
    if (!os) return appCatalog;
    return getAppsForOS(os);
  }, [os]);

  const filteredPackages = useMemo(() => {
    return selectedCategory === 'all'
      ? availableApps
      : availableApps.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, availableApps]);

  const isInBucket = useCallback((pkg: Package) => bucket.some((p) => p.id === pkg.id), [bucket]);
  const getBucketPkg = useCallback((pkg: Package) => bucket.find((p) => p.id === pkg.id), [bucket]);

  const handleAddToBucket = useCallback((pkg: Package, versionId: string) => {
    if (isInBucket(pkg)) {
      updatePackageVersion(pkg.id, versionId);
      toast.success(`🔄 ${pkg.name} version updated`);
    } else {
      addToBucket({ ...pkg, selectedVersion: versionId });
      toast.success(`✅ Added ${pkg.name} to bucket`);
    }
  }, [isInBucket, updatePackageVersion, addToBucket, toast]);

  const categories = useMemo(() => ['all', ...Array.from(new Set(availableApps.map((p) => p.category)))], [availableApps]);

  // Category keyboard shortcuts (1-9)
  const categoryShortcuts = useMemo(() => {
    const shortcuts = [];
    for (let i = 0; i < Math.min(categories.length, 9); i++) {
      const category = categories[i];
      const key = (i + 1).toString();
      shortcuts.push({
        key,
        description: `Select category: ${category}`,
        action: () => {
          setSelectedCategory(category);
          setFocusedPackageIndex(-1);
        },
      });
    }
    return shortcuts;
  }, [categories]);

  // Apply category shortcuts
  useKeyboardShortcuts(categoryShortcuts, true);

  // Generate script shortcut
  const handleGenerateScript = useCallback(() => {
    if (bucket.length === 0) {
      toast.info('Add packages to bucket first');
      return;
    }
    setCurrentStep('output');
    toast.success('🚀 Script generated');
  }, [bucket.length, setCurrentStep, toast]);

  // Add generate script shortcut
  useKeyboardShortcuts([
    {
      key: 'Enter',
      modifiers: { meta: true },
      description: 'Generate script',
      action: handleGenerateScript,
    },
  ], true);

  // Stats
  const estTime = estimateInstallTime(bucket);
  const estDisk = estimateDiskSpace(bucket);
  const diskLabel = estDisk >= 1000 ? `${(estDisk / 1000).toFixed(1)} GB` : `${estDisk} MB`;

  return (
    <div className="min-h-screen scan-lines relative">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold terminal-text">Package Catalog</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Select tools to include in your setup script
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Bucket stats */}
            {bucket.length > 0 && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono border border-border rounded-lg px-3 py-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  ~{estTime}m
                </span>
                <span className="w-px h-3 bg-border" />
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  ~{diskLabel}
                </span>
              </div>
            )}
            <button
              onClick={addDefaultAppsToBucket}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed
                border-primary/50 text-primary hover:bg-primary/10 transition-all text-sm"
            >
              <Wand2 className="w-4 h-4" />
              Add Defaults
            </button>
          </div>
        </div>

        {/* Dependency panel */}
        <DependencyPanel bucket={bucket} os={os} />

        {/* Category filters - compact pills */}
        <div className="sticky top-[60px] z-30 py-2 bg-background/90 backdrop-blur-sm -mx-6 px-6
          flex gap-1.5 flex-wrap border-b border-border/50">
          {categories.map((cat, index) => {
            const shortcutNumber = index < 9 ? index + 1 : null;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setFocusedPackageIndex(-1);
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
                }`}
                aria-keyshortcuts={shortcutNumber ? shortcutNumber.toString() : undefined}
                title={`${cat.replace('-', ' ')}${shortcutNumber ? ` (${shortcutNumber})` : ''}`}
              >
                <span className="mr-1">{categoryIcons[cat] || '📁'}</span>
                <span className="hidden sm:inline">{cat.replace('-', ' ')}</span>
              </button>
            );
          })}
        </div>

        {/* Package Grid */}
        <div
          ref={packageGridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          role="grid"
          aria-label="Package catalog"
        >
          {filteredPackages.map((pkg, index) => {
            const bucketPkg = getBucketPkg(pkg);
            return (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                os={os}
                isInBucket={isInBucket(pkg)}
                bucketNote={bucketPkg?.versionNote || ''}
                onAddToBucket={handleAddToBucket}
                onUpdateNote={updatePackageNote}
                isFocused={focusedPackageIndex === index}
                onFocus={() => setFocusedPackageIndex(index)}
                tabIndex={focusedPackageIndex === index ? 0 : -1}
              />
            );
          })}
        </div>

        {filteredPackages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No packages in this category for your OS.
          </div>
        )}
      </div>

      {/* Floating Action Button - Generate Script */}
      {bucket.length > 0 && (
        <button
          onClick={handleGenerateScript}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full
            bg-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl
            hover:scale-105 transition-all terminal-glow"
          aria-label={`Generate script with ${bucket.length} packages`}
        >
          <Terminal className="w-5 h-5" />
          <span className="hidden sm:inline">Generate</span>
          <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full
            bg-primary-foreground text-primary text-xs font-bold">
            {bucket.length}
          </span>
        </button>
      )}
    </div>
  );
}

function PackageCard({
  pkg,
  os,
  isInBucket,
  bucketNote,
  onAddToBucket,
  onUpdateNote,
  isFocused,
  onFocus,
  tabIndex,
}: {
  pkg: Package;
  os: 'macos' | 'linux' | null;
  isInBucket: boolean;
  bucketNote: string;
  onAddToBucket: (pkg: Package, versionId: string) => void;
  onUpdateNote: (pkgId: string, note: string) => void;
  isFocused?: boolean;
  onFocus?: () => void;
  tabIndex?: number;
}) {
  const { toast } = useToast();
  const [selectedVersion, setSelectedVersion] = useState(pkg.defaultVersion);
  const [dynamicVersions, setDynamicVersions] = useState<string[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [hasFetchedVersions, setHasFetchedVersions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const dynamicVersionTools = [
    // Runtimes
    'nodejs', 'python3', 'rust', 'go', 'docker', 'nvm', 'ruby', 'php', 'kotlin', 'java',
    // Databases
    'postgresql', 'redis', 'mongodb', 'mysql', 'mariadb',
    // Mobile
    'flutter',
    // IDEs
    'vscode', 'zed', 'vim',
    // Tools
    'terraform', 'ansible', 'github-cli', 'git', 'curl', 'zsh', 'oh-my-zsh', 'jq', 'htop', 'tmux',
    // Containers
    'podman', 'kubectl', 'minikube',
    // DevOps
    'jenkins', 'prometheus', 'docker-compose',
    // Frameworks
    'react', 'vue', 'angular', 'nextjs', 'django', 'flask', 'express',
    // Web Servers
    'nginx', 'apache',
    // Game Dev
    'godot', 'blender',
    // Desktop Dev
    'electron', 'tauri',
    // Mobile
    'react-native',
    // Browsers
    'zen-browser', 'brave', 'firefox',
    // Terminals
    'alacritty', 'kitty', 'hyper',
    // Data Science
    'jupyter', 'tensorflow', 'pandas', 'numpy', 'matplotlib',
    // Cloud CLIs
    'aws-cli', 'azure-cli',
  ];
  const supportsDynamic = dynamicVersionTools.includes(pkg.id);

  // Lazy load versions only when dropdown is opened
  const handleVersionDropdownOpen = async () => {
    if (!supportsDynamic || hasFetchedVersions || dynamicVersions.length > 0) return;
    
    setIsLoadingVersions(true);
    try {
      const toolId = pkg.id === 'python3' ? 'python' : pkg.id;
      const res = await fetch(`/api/versions?tool=${toolId}`);
      const data = await res.json();
      if (data.versions?.length > 0) {
        setDynamicVersions(data.versions);
      }
    } catch {
      // silently fall back to static versions
    } finally {
      setIsLoadingVersions(false);
      setHasFetchedVersions(true);
    }
  };

  const isAvailable = os ? pkg.platforms[os] : true;

  const versionsToShow =
    supportsDynamic && dynamicVersions.length > 0
      ? dynamicVersions.map((v) => ({ id: v, label: v }))
      : pkg.versions.map((v) => ({ id: v.id, label: v.label }));

  const getPreviewCommand = () => {
    if (!os) return '';
    const versionEntry = pkg.versions.find((v) => v.id === selectedVersion);
    const template = os === 'macos' ? pkg.macosCommandTemplate : pkg.linuxCommandTemplate;
    const isGeneric = ['stable', 'latest'].includes(selectedVersion);

    if (template && !isGeneric) {
      const v = selectedVersion.startsWith('v') ? selectedVersion : `v${selectedVersion}`;
      const v_no_v = selectedVersion.startsWith('v') ? selectedVersion.slice(1) : selectedVersion;
      const v_major = v_no_v.split('.')[0];
      return template
        .replaceAll('${VERSION}', v)
        .replaceAll('${VERSION_NO_V}', v_no_v)
        .replaceAll('${VERSION_MAJOR}', v_major);
    }
    return versionEntry
      ? (os === 'macos' ? versionEntry.macCommand : versionEntry.linuxCommand)
      : '';
  };

  const handleCopyCommand = async () => {
    const cmd = getPreviewCommand();
    if (!cmd) return;
    const success = await copyToClipboard(cmd);
    if (success) {
      setCopied(true);
      toast.success('📋 Command copied');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('❌ Failed to copy');
    }
  };

  const cardRef = useRef<HTMLDivElement>(null);

  // Focus the card when isFocused changes
  useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.focus();
    }
  }, [isFocused]);

  // Show details when in bucket
  useEffect(() => {
    setShowDetails(isInBucket);
  }, [isInBucket]);

  return (
    <div
      ref={cardRef}
      tabIndex={tabIndex ?? 0}
      onFocus={onFocus}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => !isInBucket && setShowDetails(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && isAvailable && !isInBucket) {
          e.preventDefault();
          onAddToBucket(pkg, selectedVersion);
        }
      }}
      className={`terminal-card rounded-lg p-4 transition-all flex flex-col focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none group ${
        isAvailable ? 'hover:border-primary/40' : 'opacity-60'
      } ${isFocused ? 'ring-2 ring-ring' : ''} ${isInBucket ? 'border-primary/30 bg-primary/5' : ''}`}
      role="article"
      aria-label={`${pkg.name} - ${pkg.description}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold terminal-text truncate">{pkg.name}</h3>
            {!isAvailable && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive border border-destructive/30 shrink-0">
                {os === 'linux' ? 'Mac' : 'Linux'}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{pkg.description}</p>
        </div>
        
        {/* Category icon */}
        <span className="text-lg shrink-0 opacity-70" title={pkg.category.replace('-', ' ')}>
          {categoryIcons[pkg.category] || '📁'}
        </span>
      </div>

      {/* Expanded details - shown on hover or when in bucket */}
      <div className={`overflow-hidden transition-all duration-200 ${showDetails ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
        {/* Version selector */}
        {(versionsToShow.length > 1 || supportsDynamic) && (
          <div className="mb-3">
            <div className="relative">
              <select
                title={`Select version for ${pkg.name}`}
                aria-label={`Select version for ${pkg.name}`}
                value={selectedVersion}
                onClick={handleVersionDropdownOpen}
                onFocus={handleVersionDropdownOpen}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedVersion(v);
                  if (isInBucket) onAddToBucket(pkg, v);
                }}
                className="w-full px-2.5 py-1.5 rounded-md bg-input border border-border text-foreground
                  appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring text-xs"
                disabled={!isAvailable || isLoadingVersions}
              >
                {versionsToShow.map((v) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
              {isLoadingVersions && (
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] terminal-text animate-pulse">
                  loading...
                </span>
              )}
            </div>
          </div>
        )}

        {/* Note badge */}
        {isInBucket && bucketNote && (
          <div className="mb-3 text-xs px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 truncate">
            📌 {bucketNote}
          </div>
        )}

        {/* Action buttons row */}
        <div className="flex gap-2">
          <button
            onClick={() => onAddToBucket(pkg, selectedVersion)}
            disabled={isInBucket || !isAvailable}
            className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
              isInBucket
                ? 'bg-primary/20 text-primary cursor-not-allowed'
                : !isAvailable
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
            aria-label={isInBucket ? `${pkg.name} is in bucket` : `Add ${pkg.name} to bucket`}
          >
            {isInBucket ? (
              <><Check className="w-3.5 h-3.5" /> Added</>
            ) : !isAvailable ? (
              <><AlertCircle className="w-3.5 h-3.5" /> N/A</>
            ) : (
              <><Plus className="w-3.5 h-3.5" /> Add</>
            )}
          </button>

          {/* Copy command - only show when details visible */}
          {isAvailable && os && (
            <button
              onClick={handleCopyCommand}
              title="Copy install command"
              className="px-2.5 py-1.5 rounded-md border border-border hover:border-primary/50 hover:bg-accent
                transition-all shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label="Copy install command"
            >
              {copied
                ? <Check className="w-3.5 h-3.5 terminal-text" />
                : <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              }
            </button>
          )}

          {/* Version note button */}
          {isInBucket && (
            <VersionNote
              pkgId={pkg.id}
              pkgName={pkg.name}
              version={selectedVersion}
              note={bucketNote}
              onSave={onUpdateNote}
              variant="compact"
            />
          )}
        </div>
      </div>

      {/* Compact action button - shown when details hidden */}
      {!showDetails && (
        <div className="mt-auto pt-3">
          <button
            onClick={() => onAddToBucket(pkg, selectedVersion)}
            disabled={!isAvailable}
            className={`w-full py-2 px-3 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
              !isAvailable
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Add to Bucket
          </button>
        </div>
      )}
    </div>
  );
}