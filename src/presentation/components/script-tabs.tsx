'use client';

import { Download, Copy, Check, Link2, Terminal, FileText, RefreshCw } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { downloadScript } from '@/infrastructure/adapters/browser/script-download.adapter';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/utils';
import { useState } from 'react';

export type Tab = 'script' | 'brewfile' | 'curl';

interface ScriptTabProps {
  script: string;
  onGenerateCurl: () => void;
  curlLoading: boolean;
}

export function ScriptTab({ script, onGenerateCurl, curlLoading }: ScriptTabProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(script);
    if (success) {
      setCopied(true);
      toast.success('📋 Script copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('❌ Failed to copy to clipboard');
    }
  };

  return (
    <div className="terminal-card rounded-lg overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-card border-b border-border gap-3">
        <span className="font-bold terminal-text font-mono text-sm">sudo-start-setup.sh</span>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleCopy}
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
            onClick={onGenerateCurl}
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
  );
}

interface BrewfileTabProps {
  brewfile: string;
}

export function BrewfileTab({ brewfile }: BrewfileTabProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(brewfile);
    if (success) {
      setCopied(true);
      toast.success('📋 Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('❌ Failed to copy');
    }
  };

  return (
    <div className="terminal-card rounded-lg overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-card border-b border-border gap-3">
        <div>
          <span className="font-bold terminal-text font-mono text-sm">Brewfile</span>
          <span className="ml-0 sm:ml-3 text-xs text-muted-foreground block sm:inline mt-1 sm:mt-0">Run with: <code className="terminal-text">brew bundle</code></span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleCopy}
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
  );
}

interface CurlTabProps {
  curlUrl: string | null;
  curlLoading: boolean;
  curlError: string | null;
  onGenerate: () => void;
}

export function CurlTab({ curlUrl, curlLoading, curlError, onGenerate }: CurlTabProps) {
  const { toast } = useToast();
  const [curlCopied, setCurlCopied] = useState(false);

  const handleCopyCurl = async () => {
    if (!curlUrl) return;
    const success = await copyToClipboard(`bash <(curl -fsSL "${curlUrl}")`);
    if (success) {
      setCurlCopied(true);
      toast.success('📋 Curl command copied');
      setTimeout(() => setCurlCopied(false), 2000);
    } else {
      toast.error('❌ Failed to copy');
    }
  };

  const handleCopyUrl = async () => {
    if (!curlUrl) return;
    const success = await copyToClipboard(curlUrl);
    if (success) {
      toast.success('📋 URL copied');
    } else {
      toast.error('❌ Failed to copy');
    }
  };

  const handleCopyCommand = async (cmd: string) => {
    const success = await copyToClipboard(cmd);
    if (success) {
      toast.success('📋 Command copied');
    } else {
      toast.error('❌ Failed to copy');
    }
  };

  return (
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
            onClick={onGenerate}
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
              <button onClick={onGenerate} disabled={curlLoading}
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
            <button onClick={handleCopyUrl}
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
                <button type="button" onClick={() => handleCopyCommand(cmd)} title="Copy command"
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
              <button type="button" onClick={() => handleCopyCommand(`curl -fsSL "${curlUrl}" | bash -s -- --verbose`)} title="Copy verbose command"
                className="shrink-0 p-1.5 rounded hover:bg-accent transition-colors">
                <Copy className="w-3 h-3" />
                <span className="sr-only">Copy verbose command</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  os: 'macos' | 'linux' | null;
  hasCurlUrl: boolean;
}

export function TabNavigation({ activeTab, onTabChange, os, hasCurlUrl }: TabNavigationProps) {
  const tabs: { id: Tab; label: string; icon: React.ReactNode; macOnly?: boolean }[] = [
    { id: 'script', label: 'Bash Script', icon: <Terminal className="w-4 h-4" /> },
    { id: 'brewfile', label: 'Brewfile', icon: <FileText className="w-4 h-4" />, macOnly: true },
    { id: 'curl', label: 'Curl URL', icon: <Link2 className="w-4 h-4" /> },
  ];

  return (
    <div className="flex gap-2">
      {tabs.map((tab) => {
        if (tab.macOnly && os !== 'macos') return null;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-mono ${
              activeTab === tab.id
                ? 'border-primary terminal-text bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.id === 'curl' && hasCurlUrl && (
              <span className="w-2 h-2 rounded-full bg-primary terminal-glow" />
            )}
          </button>
        );
      })}
    </div>
  );
}
