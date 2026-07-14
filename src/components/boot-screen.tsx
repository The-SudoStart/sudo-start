'use client';

import { useStore } from '@/lib/store';
import { OS } from '@/types';
import { Terminal } from 'lucide-react';
import { useState } from 'react';

export function BootScreen() {
    const { setOS, setShell, setCurrentStep } = useStore();
    const [selectedOS, setSelectedOS] = useState<OS | null>(null);

    const handleContinue = () => {
        if (selectedOS) {
            setOS(selectedOS);
            setShell('bash'); // Default to bash
            setCurrentStep('catalog');
        }
    };

    return (
        <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 scan-lines relative">
            <div className="flex-1 flex flex-col w-full max-w-full space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="text-left sm:text-center space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-10 h-10 sm:w-12 sm:h-12 terminal-text" />
                        <h1 className="text-3xl sm:text-5xl font-bold terminal-text">SudoStart</h1>
                    </div>
                    <p className="text-lg sm:text-xl text-muted-foreground">
                        Zero-to-Code OS Setup Generator
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="terminal-text">$</span>
                        <span>Powered by Root AI</span>
                        <span className="cursor-blink terminal-text">▊</span>
                    </div>
                </div>

                {/* Boot Questions */}
                <div className="terminal-card rounded-lg p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 flex-1 flex flex-col">
                    {/* Question 1: OS Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="terminal-text">root@sudostart:~$</span>
                            <p className="text-lg font-medium">Select your Kernel:</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pl-0 sm:pl-8">
                            <button
                                onClick={() => setSelectedOS('macos')}
                                className={`p-4 sm:p-6 rounded-lg border-2 transition-all text-left ${selectedOS === 'macos'
                                        ? 'border-primary terminal-glow bg-primary/10'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <div className="space-y-1 sm:space-y-2">
                                    <h3 className="text-lg sm:text-xl font-bold terminal-text">MacOS</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Homebrew</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setSelectedOS('linux')}
                                className={`p-4 sm:p-6 rounded-lg border-2 transition-all text-left ${selectedOS === 'linux'
                                        ? 'border-primary terminal-glow bg-primary/10'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <div className="space-y-1 sm:space-y-2">
                                    <h3 className="text-lg sm:text-xl font-bold terminal-text">Linux</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Apt</p>
                                </div>
                            </button>
                        </div>
                    </div>



                    {/* Continue Button */}
                    <div className="pt-4 mt-auto">
                        <button
                            onClick={handleContinue}
                            disabled={!selectedOS}
                            className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg bg-primary text-primary-foreground font-bold text-sm sm:text-lg
                       hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                       terminal-glow enabled:hover:shadow-lg break-all"
                        >
                            {selectedOS
                                ? `$ sudo start --os=${selectedOS} --shell=bash`
                                : '$ Select OS to continue'}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-left sm:text-center text-xs sm:text-sm text-muted-foreground pt-4">
                    <p>
                        Build your perfect development environment •{' '}
                        <span className="terminal-text">Open Source</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
