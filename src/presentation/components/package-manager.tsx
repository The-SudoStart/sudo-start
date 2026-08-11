'use client';

import { useStore } from '@/lib/store';
import { Package } from '@/types';
import { Wand2, Clock, HardDrive, Terminal } from 'lucide-react';
import { useState, useMemo, useCallback, useRef } from 'react';
import { Navbar } from '@/components/navbar';
import { DependencyPanel } from '@/components/dependency-panel';
import { useToast } from '@/hooks/use-toast';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { getCategoryMeta } from '@/lib/categories';
import { useClientUseCases } from '@/presentation/hooks/use-client-use-cases';
import { PackageCard } from './package-card';
import { CategoryFilter } from './category-filter';

export function PackageManager() {
  const { os, bucket, addToBucket, updatePackageVersion, updatePackageNote, addDefaultAppsToBucket, setCurrentStep } = useStore();
  const { toast } = useToast();
  const useCases = useClientUseCases();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [focusedPackageIndex, setFocusedPackageIndex] = useState<number>(-1);
  const packageGridRef = useRef<HTMLDivElement>(null);

  const packageCatalog = useMemo(() => (
    useCases.getPackagesForPlatformUseCase.executeSync({
      platform: os,
      category: selectedCategory as never,
    })
  ), [os, selectedCategory, useCases]);

  const filteredPackages = packageCatalog.packages;

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
  const { estimatedMinutes: estTime, diskLabel } = useCases.getInstallEstimatesUseCase.execute(bucket);

  const activeMeta = getCategoryMeta(selectedCategory);

  return (
    <div className="min-h-screen relative">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
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
              className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/10"
            >
              <Wand2 className="h-4 w-4" />
              Add defaults
            </button>
          </div>
        </div>

        {/* Dependency panel */}
        <DependencyPanel bucket={bucket} os={os} />

        {/* Category filters */}
        <CategoryFilter
          categories={packageCatalog.categories}
          categoryCounts={packageCatalog.categoryCounts}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setFocusedPackageIndex(-1);
          }}
        />

        {/* Section label */}
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <activeMeta.icon className="h-4 w-4 text-primary" />
          <span className="text-foreground">{activeMeta.label}</span>
          <span className="text-muted-foreground">· {filteredPackages.length} tools</span>
        </div>

        {/* Package Grid */}
        <div
          ref={packageGridRef}
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
          className="terminal-glow fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-soft-lg transition-all hover:brightness-105 sm:left-6 sm:translate-x-0"
          aria-label={`Generate script with ${bucket.length} packages`}
        >
          <Terminal className="h-5 w-5" />
          <span>Generate script</span>
          <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary-foreground px-1 text-xs font-bold text-primary">
            {bucket.length}
          </span>
        </button>
      )}
    </div>
  );
}
