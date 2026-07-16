'use client';

import { useStore } from '@/lib/store';
import { BootScreen } from '@/components/boot-screen';
import { PackageManager } from '@/components/package-manager';
import { ChatWindow } from '@/components/chat-window';
import { ScriptOutput } from '@/components/script-output';
import { useEffect } from 'react';

export default function Home() {
  const { currentStep, setCurrentStep } = useStore();

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const step = event.state?.step;
      if (step && ['boot', 'catalog', 'output'].includes(step)) {
        setCurrentStep(step as 'boot' | 'catalog' | 'output');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setCurrentStep]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.history.state?.step) {
      window.history.replaceState({ step: currentStep }, '', `#${currentStep}`);
    }
  }, []);

  return (
    <main className="min-h-screen">
      {currentStep === 'boot' && <BootScreen />}
      {currentStep === 'catalog' && <PackageManager />}
      {currentStep === 'output' && <ScriptOutput />}

      {/* Chat Window - Available on catalog and output steps */}
      {(currentStep === 'catalog' || currentStep === 'output') && <ChatWindow />}
    </main>
  );
}
