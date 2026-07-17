'use client';

import { useStore } from '@/lib/store';
import {
  generateScript,
  generateBrewfile,
  downloadScript,
  estimateInstallTime,
  estimateDiskSpace,
} from '@/lib/script-generator';
import {
  Download, Copy, Check, ChevronLeft, Link2, Terminal,
  RefreshCw, Clock, HardDrive, FileText, StickyNote,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useToast } from '@/hooks/use-toast';
import { ScriptExplanation } from './script-explanation';
import { copyToClipboard } from '@/lib/utils';

type Tab = 'script' | 'brewfile' | 'curl';

export function ScriptOutput() {
  const { os, shell, bucket, setCurrentStep, goBack, clearBucket } = useStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('script');
  const [copied, setCopied] = useState(false);
  const [curlCopied, setCurlCopied] = useState(false);
  const [curlUrl, setCurlUrl] = useState<string | null>(null);
  const [curlLoading, setCurlLoading] = useState(false);
  const [curlError, setCurlError] = useState<string | null>(null);
  const [showAllNotes, setShowAllNotes] = useState(false);

  // Memoize script generation to avoid recalculation on every render
  const script = useMemo(() => generateScript(os, shell, bucket), [os, shell, bucket]);
  const brewfile = useMemo(() => os === 'macos' ? generateBrewfile(bucket) : '', [os, bucket]);

  const estTime = estimateInstallTime(bucket);
  const estDisk = estimateDiskSpace(bucket);
  const diskLabel = estDisk >= 1000 ? `${(estDisk / 1000).toFixed(1)} GB` : `${estDisk} MB`;

  const pinnedPackages = bucket.filter((p) => p.versionNote?.trim());

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      toast.success('📋 Script copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('❌ Failed to copy to clipboard');
    }
  };

  const handleGenerateCurlUrl = async () => {
    setCurlLoading(true);
    setCurlError(null);
    try {
      const res = await fetch('/api/script-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, os, packages: bucket.map((p) => p.name) }),
      });
      if (!res.ok) {
        if (res.status === 429) {
          toast.error('⏳ Rate limit reached, please wait');
          throw new Error('Rate limit');
        }
        throw new Error();
      }
      const { id } = await res.json();
      setCurlUrl(`${window.location.origin}/api/script-share?id=${id}`);
      setActiveTab('curl');
      toast.success('🔗 Shareable URL created (expires in 24h)');
    } catch (error) {
      if ((error as Error).message !== 'Rate limit') {
        setCurlError('Failed to generate URL. Please try again.');
        toast.error('🌐 Connection error, please try again');
      }
    } finally {
      setCurlLoading(false);
    }
  };

  const handleCopyCurl = async () => {
    if (!curlUrl) return;
    const success = await copyToClipboard(`bash <(curl -fsSL "${curlUrl}")`);
    if (success) {
      setCurlCopied(true);
      toast.success('📋 Curl command copied to clipboard');
      setTimeout(() => setCurlCopied(false), 2000);
    } else {
      toast.error('❌ Failed to copy to clipboard');
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; macOnly?: boolean }[] = [
    { id: 'script', label: 'Bash Script', icon: <Terminal className="w-4 h-4" /> },
    { id: 'brewfile', label: 'Brewfile', icon: <FileText className="w-4 h-4" />, macOnly: true },
    { id: 'curl', label: 'Curl URL', icon: <Link2 className="w-4 h-4" /> },
  ];

  return (
    <div className="relative min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold terminal-text">Setup Script</h1>
            <p className="text-muted-foreground mt-1">Your custom environment is ready to deploy</p>
          </div>
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-border hover:border-primary/50 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Summary */}
        <div className="terminal-card rounded-lg p-4 sm:p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold terminal-text">{bucket.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Packages</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold terminal-text capitalize">{os}</p>
              <p className="text-xs text-muted-foreground mt-0.5">OS</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50 flex flex-col items-center">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 terminal-text" />
                <p className="text-2xl font-bold terminal-text">~{estTime}m</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Install time</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50 flex flex-col items-center">
              <div className="flex items-center gap-1">
                <HardDrive className="w-4 h-4 terminal-text" />
                <p className="text-2xl font-bold terminal-text">~{diskLabel}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Disk space</p>
            </div>
          </div>

          {/* Package chips */}
          <div className="flex flex-wrap gap-2">
            {bucket.map((pkg) => {
              const v = pkg.selectedVersion || pkg.defaultVersion;
              const isGeneric = ['stable', 'latest', 'fnm', 'deb', 'appimage'].includes(v);
              const hasNote = pkg.versionNote?.trim();
              return (
                <span
                  key={pkg.id}
                  className={`px-2 py-1 rounded-lg text-xs font-mono flex items-center gap-1 ${
                    hasNote
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-primary/15 text-primary'
                  }`}
                  title={hasNote ? `📌 ${pkg.versionNote}` : undefined}
                >
                  {hasNote && <StickyNote className="w-2.5 h-2.5 text-yellow-500" />}
                  {pkg.name}{!isGeneric ? ` ${v.startsWith('v') ? v : 'v' + v}` : ''}
                </span>
              );
            })}
          </div>

          {/* Version pin notes summary */}
          {pinnedPackages.length > 0 && (
            <div className="mt-4 rounded-lg border p-3 space-y-2"
              style={{ background: 'var(--note-bg)', borderColor: 'var(--note-border)' }}>
              <button
                onClick={() => setShowAllNotes(!showAllNotes)}
                className="flex items-center gap-2 text-xs font-medium w-full text-left"
                style={{ color: 'var(--note-text)' }}
              >
                <StickyNote className="w-3.5 h-3.5 text-yellow-500" />
                <span>{pinnedPackages.length} pinned version{pinnedPackages.length > 1 ? 's' : ''} with notes</span>
                <span className="ml-auto opacity-60">{showAllNotes ? '▲ hide' : '▼ show'}</span>
              </button>
              {showAllNotes && (
                <ul className="space-y-1.5 pt-1 border-t" style={{ borderColor: 'var(--note-border)' }}>
                  {pinnedPackages.map((pkg) => {
                    const v = pkg.selectedVersion || pkg.defaultVersion;
                    const isGeneric = ['stable', 'latest'].includes(v);
                    const vLabel = isGeneric ? 'stable' : v.startsWith('v') ? v : `v${v}`;
                    return (
                      <li key={pkg.id} className="flex gap-2 text-xs" style={{ color: 'var(--note-text)' }}>
                        <span className="font-mono font-medium shrink-0">{pkg.name} @ {vLabel}</span>
                        <span className="opacity-70 truncate">— {pkg.versionNote}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* Script Explanation */}
          <div className="mt-4">
            <ScriptExplanation
              script={script}
              packages={bucket}
              os={os}
              shell={shell}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map((tab) => {
            if (tab.macOnly && os !== 'macos') return null;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-mono ${
                  activeTab === tab.id
                    ? 'border-primary terminal-text bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'curl' && curlUrl && (
                  <span className="w-2 h-2 rounded-full bg-primary terminal-glow" />
                )}
              </button>
            );
          })}
        </div>

        {/* Script Tab */}
        {activeTab === 'script' && (
          <div className="terminal-card rounded-lg overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-card border-b border-border gap-3">
              <span className="font-bold terminal-text font-mono text-sm">sudo-start-setup.sh</span>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleCopy(script)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-all text-sm"
                >
                  {copied ? <><Check className="w-4 h-4 terminal-text" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                </button>
                <button
                  onClick={() => downloadScript(script)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all terminal-glow text-sm"
                >
                  <Download className="w-4 h-4" /> Download .sh
                </button>
                <button
                  onClick={handleGenerateCurlUrl}
                  disabled={curlLoading}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/50 terminal-text hover:bg-primary/10 transition-all text-sm"
                >
                  {curlLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  Curl URL
                </button>
              </div>
            </div>
            <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
              <SyntaxHighlighter
                language="bash"
                style={vscDarkPlus}
                customStyle={{ margin: 0, padding: '1.25rem', background: '#0f1115', fontSize: '0.8rem' }}
                showLineNumbers
              >
                {script}
              </SyntaxHighlighter>
            </div>
          </div>
        )}

        {/* Brewfile Tab */}
        {activeTab === 'brewfile' && os === 'macos' && (
          <div className="terminal-card rounded-lg overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-card border-b border-border gap-3">
              <div>
                <span className="font-bold terminal-text font-mono text-sm">Brewfile</span>
                <span className="ml-0 sm:ml-3 text-xs text-muted-foreground block sm:inline mt-1 sm:mt-0">Run with: <code className="terminal-text">brew bundle</code></span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleCopy(brewfile)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-all text-sm"
                >
                  {copied ? <><Check className="w-4 h-4 terminal-text" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                </button>
                <button
                  onClick={() => downloadScript(brewfile, 'Brewfile')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all terminal-glow text-sm"
                >
                  <Download className="w-4 h-4" /> Download Brewfile
                </button>
              </div>
            </div>
            <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
              <SyntaxHighlighter
                language="ruby"
                style={vscDarkPlus}
                customStyle={{ margin: 0, padding: '1.25rem', background: '#0f1115', fontSize: '0.8rem' }}
                showLineNumbers
              >
                {brewfile}
              </SyntaxHighlighter>
            </div>
          </div>
        )}

        {/* Curl URL Tab */}
        {activeTab === 'curl' && (
          <div className="terminal-card rounded-lg p-6 space-y-5">
            <div>
              <h3 className="text-lg font-bold terminal-text mb-1">One-liner Curl URL</h3>
              <p className="text-sm text-muted-foreground">
                Shareable link to run your script from any terminal. Expires in 24 hours.
              </p>
            </div>

            {!curlUrl ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border font-mono text-sm text-muted-foreground space-y-2">
                  <div>$ bash &lt;(curl -fsSL <span className="italic">&quot;https://…/api/script-share?id=xxxxxxxx&quot;</span>)</div>
                  <div className="text-xs text-muted-foreground"># Add --verbose for detailed logs</div>
                </div>
                <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-xs text-yellow-300/80 space-y-1">
                  <p className="font-bold text-yellow-400">⚠️ Security reminder</p>
                  <p>Always review scripts before piping them into bash. The URL serves exactly the script shown in the Script tab.</p>
                </div>
                <button
                  onClick={handleGenerateCurlUrl}
                  disabled={curlLoading}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground
                    hover:bg-primary/90 transition-all terminal-glow disabled:opacity-50 font-mono text-sm"
                >
                  {curlLoading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</> : <><Link2 className="w-4 h-4" /> Generate Curl URL</>}
                </button>
                {curlError && <p className="text-sm text-destructive">{curlError}</p>}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-1 rounded-lg border border-primary/40 bg-primary/5">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-primary/20 text-xs text-muted-foreground font-mono">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    URL active — expires in 24h
                    <button onClick={handleGenerateCurlUrl} disabled={curlLoading}
                      className="ml-auto flex items-center gap-1 hover:text-foreground transition-colors">
                      <RefreshCw className={`w-3 h-3 ${curlLoading ? 'animate-spin' : ''}`} />
                      Regenerate
                    </button>
                  </div>
                  <div className="p-4 font-mono text-sm break-all">
                    <span className="text-muted-foreground">$ </span>
                    <span className="terminal-text">bash</span>
                    <span className="text-muted-foreground"> &lt;(</span>
                    <span className="terminal-text">curl</span>
                    <span className="text-muted-foreground"> -fsSL </span>
                    <span className="text-yellow-400">&quot;{curlUrl}&quot;</span>
                    <span className="text-muted-foreground">)</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button onClick={handleCopyCurl}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all terminal-glow text-sm font-mono">
                    {curlCopied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy One-liner</>}
                  </button>
                  <button onClick={async () => {
                    const success = await copyToClipboard(curlUrl || '');
                    if (success) {
                      toast.success('📋 URL copied');
                    } else {
                      toast.error('❌ Failed to copy');
                    }
                  }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-all text-sm font-mono">
                    <Link2 className="w-4 h-4" /> Copy URL only
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-mono">Alternative commands:</p>
                  {[
                    { label: 'wget', cmd: `bash <(wget -qO- "${curlUrl}")` },
                    { label: 'pipe to bash', cmd: `curl -fsSL "${curlUrl}" | bash` },
                    { label: 'download only', cmd: `curl -fsSL "${curlUrl}" -o setup.sh && chmod +x setup.sh` },
                  ].map(({ label, cmd }) => (
                    <div key={label} className="flex items-center gap-2 p-3 rounded-lg bg-muted border border-border group">
                      <code className="flex-1 text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors break-all">
                        {cmd}
                      </code>
                      <button type="button" onClick={async () => {
                        const success = await copyToClipboard(cmd);
                        if (success) {
                          toast.success('📋 Command copied');
                        } else {
                          toast.error('❌ Failed to copy');
                        }
                      }} title="Copy command"
                        className="shrink-0 p-1.5 rounded hover:bg-accent transition-colors">
                        <Copy className="w-3 h-3" />
                        <span className="sr-only">Copy {label} command</span>
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 group">
                    <code className="flex-1 text-xs font-mono text-primary break-all">
                       curl -fsSL &quot;{curlUrl}&quot; | bash -s -- --verbose
                    </code>
                    <span className="text-[10px] text-muted-foreground shrink-0">with logs</span>
                    <button type="button" onClick={async () => {
                      const cmd = `curl -fsSL "${curlUrl}" | bash -s -- --verbose`;
                      const success = await copyToClipboard(cmd);
                      if (success) {
                        toast.success('📋 Command copied');
                      } else {
                        toast.error('❌ Failed to copy');
                      }
                    }} title="Copy verbose command"
                      className="shrink-0 p-1.5 rounded hover:bg-accent transition-colors">
                      <Copy className="w-3 h-3" />
                      <span className="sr-only">Copy verbose command</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button onClick={() => { clearBucket(); setCurrentStep('boot'); }}
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg border-2 border-destructive text-destructive hover:bg-destructive/10 transition-all text-sm sm:text-base">
            Start Over
          </button>
          <div className="text-xs sm:text-sm text-muted-foreground space-y-1 text-left sm:text-right w-full sm:w-auto">
            <p className="break-all">
              💡 <code className="px-1.5 sm:px-2 py-0.5 rounded bg-muted terminal-text">chmod +x sudo-start-setup.sh && ./sudo-start-setup.sh</code>
            </p>
            <p className="text-xs">
              📋 Add <code className="px-1 py-0.5 rounded bg-muted terminal-text">--verbose</code> to see detailed installation logs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
