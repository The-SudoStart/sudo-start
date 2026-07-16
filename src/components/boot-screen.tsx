'use client';

import { useStore } from '@/lib/store';
import { OS } from '@/types';
import { Apple, Monitor, Terminal, ArrowRight, Check, Sparkles, Package, Zap } from 'lucide-react';
import { useState } from 'react';

const highlights = [
    { icon: Package, label: '300+ curated tools' },
    { icon: Zap, label: 'One-command setup' },
    { icon: Sparkles, label: 'AI-assisted picks' },
];

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
        <div className="relative min-h-screen overflow-hidden">
            {/* Soft hero wash */}
            <div className="absolute inset-0 hero-wash pointer-events-none" aria-hidden="true" />

            {/* Top brand bar */}
            <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
                <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl app-icon-tile">
                        <Terminal className="h-5 w-5" />
                    </span>
                    <span className="text-lg font-bold tracking-tight">SudoStart</span>
                </div>
                <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                    Open Source
                </span>
            </header>

            <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-6 pb-20 pt-10 text-center sm:pt-16">
                {/* Eyebrow */}
                <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    The developer tool marketplace
                </span>

                {/* Headline */}
                <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
                    Your dev environment,{' '}
                    <span className="terminal-text">ready in one command</span>
                </h1>

                <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                    Browse hundreds of the best developer tools, pick the ones you love, and
                    SudoStart builds a single install script for macOS or Linux.
                </p>

                {/* Highlights */}
                <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                    {highlights.map(({ icon: Icon, label }) => (
                        <li key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Icon className="h-4 w-4 text-primary" />
                            {label}
                        </li>
                    ))}
                </ul>

                {/* OS selection card */}
                <section
                    aria-label="Choose your platform"
                    className="mt-10 w-full rounded-3xl border border-border bg-card p-6 text-left shadow-soft-lg sm:p-8"
                >
                    <h2 className="text-sm font-semibold text-muted-foreground">
                        Choose your platform to get started
                    </h2>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <OSChoice
                            active={selectedOS === 'macos'}
                            onClick={() => setSelectedOS('macos')}
                            icon={<Apple className="h-6 w-6" />}
                            title="macOS"
                            subtitle="Homebrew packages"
                        />
                        <OSChoice
                            active={selectedOS === 'linux'}
                            onClick={() => setSelectedOS('linux')}
                            icon={<Monitor className="h-6 w-6" />}
                            title="Linux"
                            subtitle="apt · snap · flatpak"
                        />
                    </div>

                    <button
                        onClick={handleContinue}
                        disabled={!selectedOS}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5
                            text-sm font-semibold text-primary-foreground transition-all
                            enabled:hover:brightness-105 enabled:hover:shadow-soft-lg
                            disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {selectedOS ? 'Browse the catalog' : 'Select a platform to continue'}
                        {selectedOS && <ArrowRight className="h-4 w-4" />}
                    </button>
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                        You can switch platforms anytime — nothing is installed until you run the script.
                    </p>
                </section>
            </main>
        </div>
    );
}

function OSChoice({
    active,
    onClick,
    icon,
    title,
    subtitle,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}) {
    return (
        <button
            onClick={onClick}
            aria-pressed={active}
            className={`group relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                active
                    ? 'border-primary bg-primary/5 shadow-soft'
                    : 'border-border bg-background hover:border-primary/40 hover:bg-accent/40'
            }`}
        >
            <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    active ? 'bg-primary text-primary-foreground' : 'app-icon-tile'
                }`}
            >
                {icon}
            </span>
            <span className="min-w-0">
                <span className="block font-semibold">{title}</span>
                <span className="block text-xs text-muted-foreground">{subtitle}</span>
            </span>
            {active && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                </span>
            )}
        </button>
    );
}
