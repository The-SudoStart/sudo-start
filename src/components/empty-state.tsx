'use client';

import { ReactNode } from 'react';
import { Package, Search, Terminal, FolderOpen, Sparkles, ArrowRight } from 'lucide-react';

export type EmptyStateIllustration = 'bucket' | 'search' | 'terminal' | 'package' | 'category';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  icon?: ReactNode;
}

export interface EmptyStateSuggestion {
  label: string;
  onClick?: () => void;
}

export interface EmptyStateProps {
  illustration: EmptyStateIllustration;
  title: string;
  description: string;
  actions?: EmptyStateAction[];
  suggestions?: EmptyStateSuggestion[];
  suggestionTitle?: string;
  children?: ReactNode;
  className?: string;
}

const illustrationConfig: Record<EmptyStateIllustration, { icon: typeof Package; color: string; animation: string }> = {
  bucket: { icon: Package, color: 'text-primary', animation: 'animate-bounce-slow' },
  search: { icon: Search, color: 'text-muted-foreground', animation: 'animate-pulse' },
  terminal: { icon: Terminal, color: 'text-primary', animation: 'animate-cursor-blink' },
  package: { icon: FolderOpen, color: 'text-muted-foreground', animation: '' },
  category: { icon: FolderOpen, color: 'text-muted-foreground', animation: '' },
};

export function EmptyState({
  illustration,
  title,
  description,
  actions,
  suggestions,
  suggestionTitle = 'Try these instead:',
  children,
  className = '',
}: EmptyStateProps) {
  const config = illustrationConfig[illustration];
  const Icon = config.icon;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-6 animate-fade-in ${className}`}
      role="status"
      aria-label={title}
    >
      {/* Illustration */}
      <div
        className={`relative mb-6 ${config.animation}`}
        aria-hidden="true"
      >
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center terminal-glow">
          <Icon className={`w-10 h-10 ${config.color}`} />
        </div>
        {illustration === 'terminal' && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-xs terminal-text animate-pulse">_</span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold terminal-text mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
        {description}
      </p>

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                action.variant === 'primary' || !action.variant
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow'
                  : 'border border-border hover:border-primary/50 hover:bg-accent/30'
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="w-full max-w-sm">
          <p className="text-xs text-muted-foreground mb-3 font-mono flex items-center gap-2 justify-center">
            <Sparkles className="w-3 h-3" />
            {suggestionTitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={suggestion.onClick}
                className="px-3 py-1.5 rounded-full text-xs border border-border hover:border-primary/50 hover:bg-accent/30 transition-all flex items-center gap-1 group"
              >
                {suggestion.label}
                {suggestion.onClick && (
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom content */}
      {children}
    </div>
  );
}

// Specialized empty state components for common use cases

export function EmptyBucketState({
  onAddDefaults,
  onBrowseCatalog,
  onOpenPresets,
  popularPackages,
}: {
  onAddDefaults: () => void;
  onBrowseCatalog: () => void;
  onOpenPresets: () => void;
  popularPackages?: { id: string; name: string; onAdd: () => void }[];
}) {
  return (
    <EmptyState
      illustration="bucket"
      title="Your bucket is ready for tools"
      description="Add tools to create your perfect development environment"
      actions={[
        {
          label: 'Add Recommended',
          onClick: onAddDefaults,
          variant: 'primary',
          icon: <Sparkles className="w-4 h-4" />,
        },
        {
          label: 'Browse Popular',
          onClick: onBrowseCatalog,
          variant: 'secondary',
        },
        {
          label: 'Load Preset',
          onClick: onOpenPresets,
          variant: 'secondary',
        },
      ]}
      suggestions={
        popularPackages?.map((pkg) => ({
          label: pkg.name,
          onClick: pkg.onAdd,
        }))
      }
      suggestionTitle="Popular tools:"
    />
  );
}

export function NoSearchResultsState({
  searchTerm,
  onBrowseAll,
  onRequestPackage,
  suggestions,
  didYouMean,
}: {
  searchTerm: string;
  onBrowseAll: () => void;
  onRequestPackage?: () => void;
  suggestions?: string[];
  didYouMean?: { label: string; onClick: () => void };
}) {
  return (
    <EmptyState
      illustration="search"
      title={`No packages match "${searchTerm}"`}
      description="Try adjusting your search terms or browse all available packages"
      actions={[
        {
          label: 'Browse All Packages',
          onClick: onBrowseAll,
          variant: 'primary',
        },
        ...(onRequestPackage
          ? [
              {
                label: 'Request Package',
                onClick: onRequestPackage,
                variant: 'secondary' as const,
              },
            ]
          : []),
      ]}
    >
      {/* Did you mean */}
      {didYouMean && (
        <div className="mt-4 p-3 rounded-lg bg-accent/30 border border-border">
          <p className="text-sm">
            Did you mean:{" "}
            <button
              onClick={didYouMean.onClick}
              className="terminal-text underline hover:no-underline"
            >
              {didYouMean.label}
            </button>
            ?
          </p>
        </div>
      )}

      {/* Search tips */}
      {suggestions && suggestions.length > 0 && (
        <div className="mt-4 text-left w-full max-w-xs">
          <p className="text-xs text-muted-foreground mb-2 font-mono">Search tips:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {suggestions.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary">›</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </EmptyState>
  );
}

export function EmptyCategoryState({
  category,
  os,
  alternativeCategories,
  onSwitchCategory,
  onSwitchOS,
}: {
  category: string;
  os: string;
  alternativeCategories?: { id: string; name: string }[];
  onSwitchCategory?: (categoryId: string) => void;
  onSwitchOS?: () => void;
}) {
  const categoryName = category.replace('-', ' ');
  
  return (
    <EmptyState
      illustration="category"
      title={`No ${categoryName} tools available for ${os}`}
      description={`These tools may not be supported on ${os} or might require manual installation`}
    >
      {/* Alternative categories */}
      {alternativeCategories && alternativeCategories.length > 0 && onSwitchCategory && (
        <div className="mt-4 w-full max-w-sm">
          <p className="text-sm text-muted-foreground mb-3">
            Try these categories instead:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {alternativeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSwitchCategory(cat.id)}
                className="px-3 py-1.5 rounded-lg text-xs border border-border hover:border-primary/50 hover:bg-accent/30 transition-all"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Switch OS option */}
      {onSwitchOS && (
        <div className="mt-4">
          <button
            onClick={onSwitchOS}
            className="text-sm terminal-text underline hover:no-underline"
          >
            Switch to {os === 'macos' ? 'Linux' : 'macOS'} to see more options
          </button>
        </div>
      )}
    </EmptyState>
  );
}

export function NoScriptGeneratedState({
  os,
  hasPackages,
  onAddTools,
}: {
  os: string | null;
  hasPackages: boolean;
  onAddTools: () => void;
}) {
  return (
    <EmptyState
      illustration="terminal"
      title="Ready to Generate"
      description="Complete the checklist below to generate your installation script"
    >
      <div className="mt-4 w-full max-w-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/10 border border-primary/20">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs text-primary-foreground">✓</span>
            </div>
            <span className="text-sm">
              OS selected: <span className="terminal-text">{os || 'Not selected'}</span>
            </span>
          </div>
          <div
            className={`flex items-center gap-3 p-2 rounded-lg border ${
              hasPackages
                ? 'bg-primary/10 border-primary/20'
                : 'bg-muted border-border'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                hasPackages ? 'bg-primary' : 'bg-muted-foreground/20'
              }`}
            >
              <span
                className={`text-xs ${
                  hasPackages ? 'text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                {hasPackages ? '✓' : '○'}
              </span>
            </div>
            <span className="text-sm">
              {hasPackages
                ? `${hasPackages} tool${hasPackages === 1 ? '' : 's'} in bucket`
                : 'Add at least one tool to bucket'}
            </span>
          </div>
        </div>

        {!hasPackages && (
          <button
            onClick={onAddTools}
            className="w-full mt-4 py-2 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all terminal-glow text-sm font-medium"
          >
            Add Tools →
          </button>
        )}
      </div>
    </EmptyState>
  );
}
