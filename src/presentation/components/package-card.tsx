'use client';

import { Package } from '@/types';
import { Plus, Check, ChevronDown, AlertCircle, Copy } from 'lucide-react';
import { AppIcon } from '@/components/app-icon';
import { useState, useEffect, useRef } from 'react';
import { VersionNote } from '@/components/version-note';
import { CommandPreview } from '@/components/command-preview';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/utils';
import { getCategoryMeta } from '@/lib/categories';
import { useClientUseCases } from '@/presentation/hooks/use-client-use-cases';
import { PlatformBadges } from './platform-badges';

interface PackageCardProps {
  pkg: Package;
  os: 'macos' | 'linux' | null;
  isInBucket: boolean;
  bucketNote: string;
  onAddToBucket: (pkg: Package, versionId: string) => void;
  onUpdateNote: (pkgId: string, note: string) => void;
  isFocused?: boolean;
  onFocus?: () => void;
  tabIndex?: number;
}

export function PackageCard({
  pkg,
  os,
  isInBucket,
  bucketNote,
  onAddToBucket,
  onUpdateNote,
  isFocused,
  onFocus,
  tabIndex,
}: PackageCardProps) {
  const { toast } = useToast();
  const useCases = useClientUseCases();
  const [selectedVersion, setSelectedVersion] = useState(pkg.defaultVersion);
  const [dynamicVersions, setDynamicVersions] = useState<string[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [hasFetchedVersions, setHasFetchedVersions] = useState(false);
  const [copied, setCopied] = useState(false);

  const versionState = useCases.getPackageVersionsUseCase.execute({ package: pkg, dynamicVersions });
  const supportsDynamic = versionState.supportsDynamic;

  // Lazy load versions only when dropdown is opened
  const handleVersionDropdownOpen = async () => {
    if (!supportsDynamic || hasFetchedVersions || dynamicVersions.length > 0) return;

    setIsLoadingVersions(true);
    try {
      const versions = await useCases.getPackageVersionsUseCase.fetchDynamicVersions(pkg);
      if (versions.length > 0) {
        setDynamicVersions(versions);
      }
    } catch {
      // silently fall back to static versions
    } finally {
      setIsLoadingVersions(false);
      setHasFetchedVersions(true);
    }
  };

  const isAvailable = os ? pkg.platforms[os] : true;
  const versionsToShow = versionState.versions;

  const getPreviewCommand = () => {
    return useCases.getPreviewCommandUseCase.execute({ package: pkg, platform: os, version: selectedVersion });
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
  const CategoryIcon = meta.icon;
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
      className={`card-lift flex flex-col rounded-2xl border bg-card p-5 shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isInBucket ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border'
      } ${isAvailable ? '' : 'opacity-60'} ${isFocused ? 'ring-2 ring-ring' : ''}`}
      role="article"
      aria-label={`${pkg.name} - ${pkg.description}`}
    >
      {/* Header: icon tile + name + category */}
      <div className="flex items-start gap-3.5">
        <AppIcon id={pkg.id} name={pkg.name} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold">{pkg.name}</h3>
            {isInBucket && (
              <span className="flex items-center gap-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                <Check className="h-2.5 w-2.5" /> Added
              </span>
            )}
          </div>
          <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <CategoryIcon className="h-3 w-3" />
            {meta.label}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-muted-foreground">
        {pkg.description}
      </p>

      {/* Platform support */}
      <div className="mt-3">
        <PlatformBadges pkg={pkg} />
      </div>

      {/* Note badge */}
      {isInBucket && bucketNote && (
        <div className="mt-3 truncate rounded-lg border border-yellow-500/25 bg-yellow-500/10 px-2 py-1 text-xs text-yellow-700 dark:text-yellow-400">
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
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isInBucket
                ? 'cursor-not-allowed bg-primary/15 text-primary'
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
