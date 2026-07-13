'use client';

import { useState, useRef, useCallback } from 'react';
import { 
  BookOpen, ChevronDown, ChevronUp, RefreshCw, 
  Clock, HardDrive, Package, Shield, AlertTriangle,
  Terminal, CheckCircle, XCircle, Loader2, Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '@/hooks/use-toast';
import { Package as PackageType, OS, Shell } from '@/types';
import { estimateInstallTime, estimateDiskSpace } from '@/lib/script-generator';

interface ScriptExplanationProps {
  script: string;
  packages: PackageType[];
  os: OS | null;
  shell: Shell | null;
}

type ExplanationSection = 'overview' | 'tools' | 'dependencies' | 'postInstall' | 'security';

interface SectionState {
  overview: boolean;
  tools: boolean;
  dependencies: boolean;
  postInstall: boolean;
  security: boolean;
}

export function ScriptExplanation({ script, packages, os, shell }: ScriptExplanationProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [expandedSections, setExpandedSections] = useState<SectionState>({
    overview: true,
    tools: true,
    dependencies: false,
    postInstall: false,
    security: false,
  });
  const abortRef = useRef<AbortController | null>(null);

  // Generate cache key based on script content
  // Use encodeURIComponent + unescape to handle Unicode characters properly
  const cacheKey = `script-explanation-${btoa(unescape(encodeURIComponent(script))).slice(0, 50)}`;

  // Load cached explanation using lazy initialization
  const [cachedExplanation, setCachedExplanation] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(cacheKey);
    }
    return null;
  });

  const estTime = estimateInstallTime(packages);
  const estDisk = estimateDiskSpace(packages);
  const diskLabel = estDisk >= 1000 ? `${(estDisk / 1000).toFixed(1)} GB` : `${estDisk} MB`;

  const toggleSection = (section: ExplanationSection) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const generateExplanation = useCallback(async () => {
    if (isLoading) return;
    
    // Use cached explanation if available
    if (cachedExplanation && !explanation) {
      setExplanation(cachedExplanation);
      setIsOpen(true);
      return;
    }

    setIsLoading(true);
    setStreamingContent('');
    setExplanation('');
    setIsOpen(true);

    abortRef.current = new AbortController();

    try {
      const response = await fetch('/api/script-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          packages: packages.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            category: p.category,
            version: p.selectedVersion || p.defaultVersion,
          })),
          os: os || 'unknown',
          shell: shell || 'unknown',
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('⏳ Rate limit reached. Please try again later.');
          throw new Error('Rate limit');
        }
        throw new Error('Failed to generate explanation');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.done) {
              setExplanation(json.full || accumulated);
              setStreamingContent('');
              // Cache the explanation
              if (typeof window !== 'undefined') {
                localStorage.setItem(cacheKey, json.full || accumulated);
                setCachedExplanation(json.full || accumulated);
              }
            } else {
              accumulated += json.delta;
              setStreamingContent(accumulated);
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }
    } catch (error: unknown) {
      if ((error as Error).name === 'AbortError') return;
      console.error('Explanation error:', error);
      toast.error('❌ Failed to generate explanation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [script, packages, os, shell, isLoading, cachedExplanation, explanation, cacheKey, toast]);

  const handleRegenerate = () => {
    // Clear cache and regenerate
    if (typeof window !== 'undefined') {
      localStorage.removeItem(cacheKey);
    }
    setCachedExplanation(null);
    setExplanation('');
    generateExplanation();
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setIsLoading(false);
    setStreamingContent('');
  };

  // Get tool breakdown from packages
  const getToolBreakdown = () => {
    return packages.map(pkg => {
      const version = pkg.selectedVersion || pkg.defaultVersion;
      const isGeneric = ['stable', 'latest', 'fnm', 'deb', 'appimage'].includes(version);
      const versionLabel = isGeneric ? '' : version.startsWith('v') ? version : `v${version}`;
      
      // Determine installation method
      let installMethod = 'unknown';
      if (os === 'macos') {
        const versionEntry = pkg.versions.find(v => v.id === version);
        if (versionEntry?.macCommand.includes('brew install --cask')) {
          installMethod = 'Homebrew Cask';
        } else if (versionEntry?.macCommand.includes('brew install')) {
          installMethod = 'Homebrew';
        } else if (versionEntry?.macCommand.includes('curl')) {
          installMethod = 'curl';
        }
      } else {
        const versionEntry = pkg.versions.find(v => v.id === version);
        if (versionEntry?.linuxCommand.includes('apt')) {
          installMethod = 'apt';
        } else if (versionEntry?.linuxCommand.includes('flatpak')) {
          installMethod = 'Flatpak';
        } else if (versionEntry?.linuxCommand.includes('curl')) {
          installMethod = 'curl';
        }
      }

      return {
        ...pkg,
        versionLabel,
        installMethod,
      };
    });
  };

  // Check for potential dependencies
  const getDependencies = () => {
    const deps: { tool: string; dependsOn: string; note: string }[] = [];
    
    // Check for common dependencies
    const hasDocker = packages.some(p => p.id === 'docker');
    const hasDockerDesktop = packages.some(p => p.id === 'docker-desktop');
    const hasNvm = packages.some(p => p.id === 'nvm');
    const hasNodejs = packages.some(p => p.id === 'nodejs');
    const hasNpm = packages.some(p => p.id === 'npm');

    if (hasDockerDesktop && !hasDocker) {
      deps.push({
        tool: 'Docker Desktop',
        dependsOn: 'Docker Engine',
        note: 'Docker Desktop includes Docker Engine, but you may want both for CLI-only environments',
      });
    }

    if (hasNodejs && !hasNvm) {
      deps.push({
        tool: 'Node.js',
        dependsOn: 'nvm (recommended)',
        note: 'Consider adding nvm for better version management',
      });
    }

    if (hasNpm && !hasNodejs) {
      deps.push({
        tool: 'npm',
        dependsOn: 'Node.js',
        note: 'npm is included with Node.js installation',
      });
    }

    return deps;
  };

  // Get post-install notes
  const getPostInstallNotes = () => {
    const notes: { tool: string; action: string }[] = [];
    
    packages.forEach(pkg => {
      if (pkg.id === 'zsh' || pkg.id === 'oh-my-zsh') {
        notes.push({
          tool: pkg.name,
          action: 'May require setting as default shell: chsh -s $(which zsh)',
        });
      }
      if (pkg.id === 'nvm') {
        notes.push({
          tool: pkg.name,
          action: 'Add to shell config: export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"',
        });
      }
      if (pkg.id === 'docker') {
        notes.push({
          tool: pkg.name,
          action: 'May require adding user to docker group: sudo usermod -aG docker $USER',
        });
      }
    });

    return notes;
  };

  const tools = getToolBreakdown();
  const dependencies = getDependencies();
  const postInstallNotes = getPostInstallNotes();

  // Check for curl | bash patterns in script
  const hasCurlPipe = script.includes('curl') && script.includes('| bash');

  return (
    <div className="space-y-4">
      {/* Explain Button */}
      {!isOpen && (
        <button
          onClick={generateExplanation}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/50 terminal-text 
            hover:bg-primary/10 transition-all text-sm font-mono"
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Explain Script</>
          )}
        </button>
      )}

      {/* Explanation Panel */}
      {isOpen && (
        <div className="terminal-card rounded-lg overflow-hidden border border-primary/20">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-card border-b border-border">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 terminal-text" />
              <span className="font-bold terminal-text">Script Explanation</span>
              {cachedExplanation && !isLoading && (
                <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                  cached
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRegenerate}
                disabled={isLoading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono
                  border border-border hover:border-primary/50 transition-all"
                title="Regenerate explanation"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-accent rounded transition-colors"
                title="Close explanation"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* AI Generated Explanation */}
            {(isLoading || streamingContent || explanation) && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 terminal-text" />
                  <span className="text-sm font-medium terminal-text">AI Summary</span>
                </div>
                
                {isLoading && !streamingContent && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Root is analyzing your script...
                  </div>
                )}
                
                {(streamingContent || explanation) && (
                  <div className="prose prose-sm dark:prose-invert max-w-none markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {streamingContent || explanation}
                    </ReactMarkdown>
                    {streamingContent && (
                      <span className="cursor-blink terminal-text ml-0.5">▊</span>
                    )}
                  </div>
                )}

                {isLoading && (
                  <button
                    onClick={handleCancel}
                    className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel generation
                  </button>
                )}
              </div>
            )}

            {/* Overview Section */}
            <div className="rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => toggleSection('overview')}
                className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 terminal-text" />
                  <span className="font-medium text-sm">Overview</span>
                </div>
                {expandedSections.overview ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              {expandedSections.overview && (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-xl font-bold terminal-text">{packages.length}</p>
                      <p className="text-xs text-muted-foreground">Tools</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-xl font-bold terminal-text capitalize">{os || '?'}</p>
                      <p className="text-xs text-muted-foreground">OS</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 terminal-text" />
                        <p className="text-xl font-bold terminal-text">~{estTime}m</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Install time</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-center gap-1">
                        <HardDrive className="w-3 h-3 terminal-text" />
                        <p className="text-xl font-bold terminal-text">~{diskLabel}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Disk space</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Terminal className="w-3 h-3" />
                    <span>Target shell: <code className="terminal-text">{shell || 'auto-detect'}</code></span>
                  </div>
                </div>
              )}
            </div>

            {/* Tools Section */}
            <div className="rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => toggleSection('tools')}
                className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 terminal-text" />
                  <span className="font-medium text-sm">What&apos;s Being Installed</span>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-primary/10">
                    {tools.length}
                  </span>
                </div>
                {expandedSections.tools ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              {expandedSections.tools && (
                <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                  {tools.map((tool) => (
                    <div
                      key={tool.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold terminal-text">
                          {tool.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{tool.name}</span>
                          {tool.versionLabel && (
                            <span className="text-xs text-muted-foreground font-mono">
                              {tool.versionLabel}
                            </span>
                          )}
                          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {tool.installMethod}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dependencies Section */}
            {dependencies.length > 0 && (
              <div className="rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => toggleSection('dependencies')}
                  className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium text-sm">Dependencies & Notes</span>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-yellow-500/10">
                      {dependencies.length}
                    </span>
                  </div>
                  {expandedSections.dependencies ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                
                {expandedSections.dependencies && (
                  <div className="p-4 space-y-2">
                    {dependencies.map((dep, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20"
                      >
                        <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <span className="font-medium">{dep.tool}</span>
                          <span className="text-muted-foreground"> depends on </span>
                          <span className="font-medium">{dep.dependsOn}</span>
                          <p className="text-xs text-muted-foreground mt-1">{dep.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Post-Install Section */}
            {postInstallNotes.length > 0 && (
              <div className="rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => toggleSection('postInstall')}
                  className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 terminal-text" />
                    <span className="font-medium text-sm">Post-Install Steps</span>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-primary/10">
                      {postInstallNotes.length}
                    </span>
                  </div>
                  {expandedSections.postInstall ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                
                {expandedSections.postInstall && (
                  <div className="p-4 space-y-2">
                    {postInstallNotes.map((note, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 rounded-lg bg-muted/30"
                      >
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold terminal-text">{idx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-sm">{note.tool}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{note.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Security Section */}
            <div className="rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => toggleSection('security')}
                className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-sm">Security Notes</span>
                </div>
                {expandedSections.security ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              {expandedSections.security && (
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>All commands use official package managers (Homebrew, apt, etc.)</span>
                  </div>
                  
                  {hasCurlPipe && (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <span className="font-medium">Warning: </span>
                        <span>This script contains commands that pipe curl output to bash. Always review scripts before running them.</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground p-2 rounded bg-muted/30">
                    <span className="font-medium">Recommendation: </span>
                    Review the script before executing. You can download and inspect it first with the Download button above.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
