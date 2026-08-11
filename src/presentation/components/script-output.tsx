'use client';

import { useStore } from '@/lib/store';
import { clientContainer } from '@/infrastructure/config/client-container';
import { ChevronLeft } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ScriptSummary } from './script-summary';
import { TabNavigation, ScriptTab, BrewfileTab, CurlTab, Tab } from './script-tabs';

export function ScriptOutput() {
  const { os, shell, bucket, setCurrentStep, goBack, clearBucket } = useStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('script');
  const [curlUrl, setCurlUrl] = useState<string | null>(null);
  const [curlLoading, setCurlLoading] = useState(false);
  const [curlError, setCurlError] = useState<string | null>(null);

  // Memoize script generation to avoid recalculation on every render
  const script = useMemo(() => {
    if (!os || !shell) return '# Please select an OS and Shell to generate a script';
    return clientContainer.generateScriptUseCase.executeSync({
      platform: os,
      shell,
      packages: bucket,
    }).script;
  }, [os, shell, bucket]);

  const brewfile = useMemo(() => (
    os === 'macos' ? clientContainer.generateBrewfileUseCase.execute(bucket) : ''
  ), [os, bucket]);

  const estimates = clientContainer.getInstallEstimatesUseCase.execute(bucket);

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

  const handleStartOver = () => {
    clearBucket();
    setCurrentStep('boot');
  };

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
        <ScriptSummary
          bucket={bucket}
          os={os}
          shell={shell}
          script={script}
          estimates={estimates}
        />

        {/* Tabs */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          os={os}
          hasCurlUrl={!!curlUrl}
        />

        {/* Script Tab */}
        {activeTab === 'script' && (
          <ScriptTab
            script={script}
            onGenerateCurl={handleGenerateCurlUrl}
            curlLoading={curlLoading}
          />
        )}

        {/* Brewfile Tab */}
        {activeTab === 'brewfile' && os === 'macos' && (
          <BrewfileTab brewfile={brewfile} />
        )}

        {/* Curl URL Tab */}
        {activeTab === 'curl' && (
          <CurlTab
            curlUrl={curlUrl}
            curlLoading={curlLoading}
            curlError={curlError}
            onGenerate={handleGenerateCurlUrl}
          />
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button
            onClick={handleStartOver}
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg border-2 border-destructive text-destructive hover:bg-destructive/10 transition-all text-sm sm:text-base"
          >
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
