'use client';

import { useStore } from '@/lib/store';
import { appCatalog, getAppsForOS } from '@/lib/apps';
import { Package } from '@/types';
import { Plus, Check, ChevronDown, AlertCircle, Wand2, Copy, Clock, HardDrive, Terminal, Apple, Monitor } from 'lucide-react';
import { AppIcon } from './app-icon';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './navbar';
import { DependencyPanel } from './dependency-panel';
import { VersionNote } from './version-note';
import { CommandPreview } from './command-preview';
import { estimateInstallTime, estimateDiskSpace } from '@/lib/script-generator';
import { useToast } from '@/hooks/use-toast';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { copyToClipboard } from '@/lib/utils';
import { getCategoryMeta, getCategoryFamilyClass } from '@/lib/categories';

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
      toast.success(`${pkg.name} version updated`);
    } else {
      addToBucket({ ...pkg, selectedVersion: versionId });
      toast.success(`Added ${pkg.name} to bucket`);
    }
  }, [isInBucket, updatePackageVersion, addToBucket, toast]);

  const categories = useMemo(() => ['all', ...Array.from(new Set(availableApps.map((p) => p.category)))], [availableApps]);

  // Count per category for the filter chips
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: availableApps.length };
    for (const p of availableApps) counts[p.category] = (counts[p.category] || 0) + 1;
    return counts;
  }, [availableApps]);

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
    toast.success('Script generated');
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

  const activeMeta = getCategoryMeta(selectedCategory);

  return (
    <div className="min-h-screen relative">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <h1 className="font-display text-3xl font-bold sm:text-[2.5rem] sm:leading-[2.75rem]">
              Explore developer tools
            </h1>
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Hand-pick the tools you want, choose versions, and generate a single install
              script for {os === 'macos' ? 'macOS' : os === 'linux' ? 'Linux' : 'your machine'}.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {bucket.length > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground shadow-soft">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  ~{estTime}m
                </span>
                <span className="h-3.5 w-px bg-border" />
                <span className="flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-primary" />
                  ~{diskLabel}
                </span>
              </div>
            )}
            <button
              onClick={addDefaultAppsToBucket}
              className="press-spring flex items-center gap-2 rounded-lg border border-line-strong bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
            >
              <Wand2 className="h-4 w-4" />
              Add defaults
            </button>
          </div>
        </div>

        {/* Dependency panel */}
        <DependencyPanel bucket={bucket} os={os} />

        {/* Category filters */}
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
                  onClick={() => {
                    setSelectedCategory(cat);
                    setFocusedPackageIndex(-1);
                  }}
                  className={`${getCategoryFamilyClass(cat)} flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isSelected
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-card text-foreground hover:border-line-strong'
                  }`}
                  aria-pressed={isSelected}
                  aria-keyshortcuts={shortcutNumber ? shortcutNumber.toString() : undefined}
                  title={`${meta.label}${shortcutNumber ? ` (${shortcutNumber})` : ''}`}
                >
                  {meta.family ? <span className="fam-dot" aria-hidden="true" /> : <Icon className="h-4 w-4" />}
                  <span>{meta.label}</span>
                  <span
                    className={`ml-0.5 rounded-full px-1.5 font-mono text-[11px] tabular-nums ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {categoryCounts[cat] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section label */}
        <div className="label-caps flex items-center gap-2 text-muted-foreground">
          <activeMeta.icon className="h-4 w-4 text-primary" />
          <span className="text-foreground">{activeMeta.label}</span>
          <span className="tabular-nums">· {filteredPackages.length} tools</span>
        </div>

        {/* Package Grid */}
        <div
          ref={packageGridRef}
          // Remount on category change so the cards ripple in again.
          key={selectedCategory}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
                staggerIndex={Math.min(index, 12)}
              />
            );
          })}
        </div>

        {filteredPackages.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            No packages in this category for your platform.
          </div>
        )}
      </div>

      {/* Floating Action Button - Generate Script */}
      {bucket.length > 0 && (
        <button
          onClick={handleGenerateScript}
          className="fab-in terminal-glow press-spring fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground hover:brightness-105 sm:left-6 sm:translate-x-0"
          aria-label={`Generate script with ${bucket.length} packages`}
        >
          <Terminal className="h-5 w-5" />
          <span>Generate script</span>
          <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary-foreground px-1 font-mono text-[11px] font-semibold tabular-nums text-primary">
            {bucket.length}
          </span>
        </button>
      )}
    </div>
  );
}

function PlatformBadges({ pkg }: { pkg: Package }) {
  return (
    <div className="flex items-center gap-1.5">
      {pkg.platforms.macos && (
        <span
          title="Available on macOS"
          className="flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
        >
          <Apple className="h-3 w-3" /> macOS
        </span>
      )}
      {pkg.platforms.linux && (
        <span
          title="Available on Linux"
          className="flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
        >
          <Monitor className="h-3 w-3" /> Linux
        </span>
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
  staggerIndex = 0,
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
  /** Position in the entrance ripple; capped so long lists don't lag. */
  staggerIndex?: number;
}) {
  const { toast } = useToast();
  const [selectedVersion, setSelectedVersion] = useState(pkg.defaultVersion);
  const [dynamicVersions, setDynamicVersions] = useState<string[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [hasFetchedVersions, setHasFetchedVersions] = useState(false);
  const [copied, setCopied] = useState(false);

  const dynamicVersionTools = [
    // Runtimes
    'nodejs', 'python3', 'rust', 'go', 'docker', 'nvm', 'ruby', 'php', 'kotlin', 'java',
    'bun', 'deno', 'elixir', 'erlang', 'scala', 'clojure', 'haskell', 'lua', 'perl', 'r',
    // Databases
    'postgresql', 'redis', 'mongodb', 'mysql', 'mariadb', 'sqlite3',
    'cockroachdb', 'cassandra', 'neo4j', 'clickhouse', 'timescaledb',
    // Mobile
    'flutter',
    // IDEs
    'vscode', 'zed', 'vim', 'neovim', 'emacs', 'antigravity',
    // Tools
    'terraform', 'ansible', 'github-cli', 'git', 'curl', 'zsh', 'oh-my-zsh', 'jq', 'htop', 'tmux',
    'lazygit', 'delta', 'httpie', 'pandoc',
    // Containers
    'podman', 'kubectl', 'minikube', 'lima', 'multipass', 'vagrant', 'packer', 'buildah', 'skopeo',
    // DevOps
    'jenkins', 'prometheus', 'docker-compose', 'pulumi', 'helm', 'kustomize', 'argocd-cli',
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
    'aws-cli', 'azure-cli', 'gcloud', 'vercel-cli', 'netlify-cli', 'supabase-cli', 'stripe-cli', 'aws-cdk',
    // Security
    'bitwarden-cli', '1password-cli', 'gpg', 'openssl', 'wireguard',
    // Media
    'gimp', 'inkscape', 'krita', 'audacity', 'obs-studio', 'ffmpeg', 'imagemagick',
    // VCS
    'git-lfs', 'github-desktop', 'sublime-merge', 'fork', 'tower',
    // Utilities
    'ripgrep', 'fd', 'fzf', 'bat', 'exa', 'dust', 'bottom', 'glances', 'ngrok', 'insomnia',
    // Productivity
    'notion', 'obsidian', 'logseq', 'todoist', 'taskwarrior', 'timewarrior', 'calcurse', 'newsboat',
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
      toast.success('Command copied');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy');
    }
  };

  const cardRef = useRef<HTMLDivElement>(null);

  // Focus the card when isFocused changes
  useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.focus();
    }
  }, [isFocused]);

  const meta = getCategoryMeta(pkg.category);
  const hasVersions = versionsToShow.length > 1 || supportsDynamic;

  return (
    <div
      ref={cardRef}
      tabIndex={tabIndex ?? 0}
      onFocus={onFocus}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && isAvailable && !isInBucket) {
          e.preventDefault();
          onAddToBucket(pkg, selectedVersion);
        }
      }}
      style={{ '--i': staggerIndex } as React.CSSProperties}
      className={`${getCategoryFamilyClass(pkg.category)} card-in spotlight-card flex flex-col rounded-lg border bg-card p-5 shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isInBucket ? 'border-primary ring-[3px] ring-bios-soft' : 'border-border'
      } ${isAvailable ? '' : 'opacity-60'} ${isFocused ? 'ring-2 ring-ring' : ''}`}
      role="article"
      aria-label={`${pkg.name} - ${pkg.description}`}
    >
      {/* Header: icon tile + name + category */}
      <div className="flex items-start gap-3.5">
        <span className="fam-tile flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
          <AppIcon id={pkg.id} name={pkg.name} size={48} className="rounded-lg" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold">{pkg.name}</h3>
            {isInBucket && (
              <span className="status-tag status-ok">ADDED</span>
            )}
          </div>
          <span className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="fam-dot" aria-hidden="true" />
            {meta.label}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-muted-foreground">
        {pkg.description}
      </p>

      {/* Install command: shows exactly what will run */}
      {isAvailable && os && getPreviewCommand() && (
        <code
          className="mt-3 block truncate rounded-md bg-muted px-2 py-1 font-mono text-[11.5px] text-muted-foreground"
          title={getPreviewCommand()}
        >
          <span className="text-primary">$ </span>{getPreviewCommand()}
        </code>
      )}

      {/* Platform support */}
      <div className="mt-3">
        <PlatformBadges pkg={pkg} />
      </div>

      {/* Note badge */}
      {isInBucket && bucketNote && (
        <div className="mt-3 truncate rounded-md border border-warn/30 bg-warn-soft px-2 py-1 text-xs text-warn">
          {bucketNote}
        </div>
      )}

      {/* Footer: version + actions */}
      <div className="mt-4 flex flex-col gap-2">
        {hasVersions ? (
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
              className="w-full cursor-pointer appearance-none rounded-lg border border-border bg-input py-2 pl-3 pr-7 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={!isAvailable || isLoadingVersions}
            >
              {versionsToShow.map((v) => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-50" />
            {isLoadingVersions && (
              <span className="absolute right-7 top-1/2 -translate-y-1/2 text-[10px] text-primary">…</span>
            )}
          </div>
        ) : (
          <div className="h-[36px]" aria-hidden="true" />
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddToBucket(pkg, selectedVersion)}
            disabled={isInBucket || !isAvailable}
            className={`press-spring flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isInBucket
                ? 'cursor-not-allowed bg-bios-soft text-primary'
                : !isAvailable
                ? 'cursor-not-allowed bg-muted text-muted-foreground'
                : 'bg-primary text-primary-foreground hover:brightness-105'
            }`}
            aria-label={isInBucket ? `${pkg.name} is in bucket` : `Add ${pkg.name} to bucket`}
          >
            {isInBucket ? (
              <><Check className="h-3.5 w-3.5" /> Added</>
            ) : !isAvailable ? (
              <><AlertCircle className="h-3.5 w-3.5" /> N/A</>
            ) : (
              <><Plus className="h-3.5 w-3.5" /> Add</>
            )}
          </button>

          {isAvailable && os && (
            <button
              onClick={handleCopyCommand}
              title="Copy install command"
              className="shrink-0 rounded-lg border border-border p-2 transition-all hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Copy install command"
            >
              {copied
                ? <Check className="h-3.5 w-3.5 text-primary" />
                : <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              }
            </button>
          )}

          {/* Command Preview button — always shown when OS is selected */}
          {os && isAvailable && (
            <CommandPreview
              command={getPreviewCommand()}
              packageName={pkg.name}
              os={os}
              version={selectedVersion}
            />
          )}

          {/* Version note button — only shown when package is in bucket */}
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
    </div>
  );
}
