'use client';

import { useStore } from '@/lib/store';
import { appCatalog, getAppsForOS } from '@/lib/apps';
import { Package } from '@/types';
import { Plus, Check, ChevronDown, AlertCircle, Wand2, Copy, Clock, HardDrive } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Navbar } from './navbar';
import { DependencyPanel } from './dependency-panel';
import { VersionNote } from './version-note';
import { CommandPreview } from './command-preview';
import { estimateInstallTime, estimateDiskSpace } from '@/lib/script-generator';

const categoryIcons: Record<string, string> = {
  all: '🗂️', ide: '📝', browser: '🌐', tool: '🔧', runtime: '⚙️',
  container: '📦', database: '💾', terminal: '💻', framework: '🧱',
  devops: '♾️', 'data-science': '🧪', mobile: '📱', 'game-dev': '🎮',
  'desktop-dev': '🖥️', 'web-server': '🌍', 'package-manager': '📌',
  'build-tool': '🔨', cloud: '☁️', utility: '🛠️', communication: '💬',
  productivity: '🚀',
};

export function PackageManager() {
  const { os, bucket, addToBucket, updatePackageVersion, updatePackageNote, addDefaultAppsToBucket } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const availableApps = useMemo(() => {
    if (!os) return appCatalog;
    return getAppsForOS(os);
  }, [os]);

  const filteredPackages =
    selectedCategory === 'all'
      ? availableApps
      : availableApps.filter((p) => p.category === selectedCategory);

  const isInBucket = (pkg: Package) => bucket.some((p) => p.id === pkg.id);
  const getBucketPkg = (pkg: Package) => bucket.find((p) => p.id === pkg.id);

  const handleAddToBucket = (pkg: Package, versionId: string) => {
    if (isInBucket(pkg)) {
      updatePackageVersion(pkg.id, versionId);
    } else {
      addToBucket({ ...pkg, selectedVersion: versionId });
    }
  };

  const categories = ['all', ...Array.from(new Set(availableApps.map((p) => p.category)))];

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

        {/* Category filters */}
        <div className="sticky top-[60px] z-30 py-3 bg-background/90 backdrop-blur-sm -mx-6 px-6
          flex gap-2 flex-wrap border-b border-border/50">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-all capitalize ${
                selectedCategory === cat
                  ? 'border-primary terminal-glow bg-primary/10 terminal-text'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {categoryIcons[cat] || '📁'} {cat.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPackages.map((pkg) => {
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
}: {
  pkg: Package;
  os: 'macos' | 'linux' | null;
  isInBucket: boolean;
  bucketNote: string;
  onAddToBucket: (pkg: Package, versionId: string) => void;
  onUpdateNote: (pkgId: string, note: string) => void;
}) {
  const [selectedVersion, setSelectedVersion] = useState(pkg.defaultVersion);
  const [dynamicVersions, setDynamicVersions] = useState<string[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [hasFetchedVersions, setHasFetchedVersions] = useState(false);
  const [copied, setCopied] = useState(false);

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
        // Don't auto-change selected version, let user choose
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
    await navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`terminal-card rounded-lg p-5 transition-all flex flex-col ${
        isAvailable ? 'hover:border-primary/50' : 'opacity-60'
      }`}
    >
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold terminal-text">{pkg.name}</h3>
              {!isAvailable && (
                <span className="text-xs px-2 py-0.5 rounded bg-destructive/20 text-destructive border border-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {os === 'linux' ? 'Mac Only' : 'Linux Only'}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
            <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded border border-border capitalize">
              {categoryIcons[pkg.category] || '📁'} {pkg.category.replace('-', ' ')}
            </span>
          </div>

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

        {/* Version selector */}
        {(versionsToShow.length > 1 || supportsDynamic) && (
          <div className="mt-4 space-y-1.5">
            <label className="text-xs text-muted-foreground flex items-center gap-2">
              Version:
              {isLoadingVersions && (
                <span className="text-xs terminal-text animate-pulse">fetching...</span>
              )}
            </label>
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
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground
                  appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                disabled={!isAvailable || isLoadingVersions}
              >
                {versionsToShow.map((v) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-60" />
            </div>
          </div>
        )}

        {/* Show pinned note inline on card if present */}
        {isInBucket && bucketNote && (
          <div className="mt-3 version-note-badge" title={bucketNote}>
            📌 {bucketNote}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onAddToBucket(pkg, selectedVersion)}
          disabled={isInBucket || !isAvailable}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm ${
            isInBucket
              ? 'bg-primary/20 text-primary cursor-not-allowed'
              : !isAvailable
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow'
          }`}
        >
          {isInBucket ? (
            <><Check className="w-4 h-4" /> In Bucket</>
          ) : !isAvailable ? (
            <><AlertCircle className="w-4 h-4" /> Unavailable</>
          ) : (
            <><Plus className="w-4 h-4" /> Add</>
          )}
        </button>

        {/* Copy install command */}
        {isAvailable && os && (
          <button
            onClick={handleCopyCommand}
            title="Copy install command"
            className="p-2 rounded-lg border border-border hover:border-primary/50 hover:bg-accent
              transition-all shrink-0"
          >
            {copied
              ? <Check className="w-4 h-4 terminal-text" />
              : <Copy className="w-4 h-4 text-muted-foreground" />
            }
          </button>
        )}
      </div>
    </div>
  );
}