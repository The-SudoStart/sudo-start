'use client';

import { useStore } from '@/lib/store';
import { appCatalog } from '@/lib/apps';
import { presets } from '@/lib/presets';
import { OS } from '@/types';
import { Apple, Check, Monitor } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';
import { ThemeToggle } from '@/components/theme-toggle';
import { FloatingTools } from '@/components/floating-tools';
import { HeroDemo } from '@/components/hero-demo';
import { LogoMarquee } from '@/components/logo-marquee';

const starterStacks = [
  {
    presetId: 'frontend-dev',
    title: 'Web Development',
    description: 'A modern toolkit for building web apps.',
    toolIds: ['vscode', 'nodejs', 'git', 'pnpm'],
  },
  {
    presetId: 'rust-systems',
    title: 'Rust Development',
    description: 'A focused setup for systems and CLI work.',
    toolIds: ['rust', 'zed', 'git', 'cmake'],
  },
  {
    presetId: 'devops-cloud',
    title: 'DevOps',
    description: 'Core tools for containers and infrastructure.',
    toolIds: ['docker', 'kubectl', 'terraform', 'ansible'],
  },
];

export function BootScreen() {
  const { setOS, setShell, setCurrentStep, loadPreset } = useStore();
  const [appliedPreset, setAppliedPreset] = useState<string | null>(null);

  const choosePlatform = (os: OS) => {
    setOS(os);
    setShell('bash');
    setCurrentStep('catalog');
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-background">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="#boot" className="flex items-center gap-2.5 rounded-md text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="SudoStart home">
          <BrandMark size={36} />
        </a>
        <nav aria-label="Main navigation" className="flex items-center gap-4 whitespace-nowrap text-sm font-medium text-muted-foreground sm:gap-7">
          <Link href="/how-it-works" className="transition-colors hover:text-foreground">How it works</Link>
          <a href="https://github.com/The-SudoStart/sudo-start" target="_blank" rel="noreferrer" className="hidden transition-colors hover:text-foreground sm:inline">GitHub</a>
          <ThemeToggle />
        </nav>
      </header>

      <main className="relative mx-auto w-full max-w-7xl flex-1 px-5 sm:px-8">
        <div className="hero-wash pointer-events-none absolute inset-x-0 top-0 -z-0 h-[36rem]" aria-hidden="true" />
        <section className="relative grid items-center gap-12 pb-12 pt-10 sm:pb-16 sm:pt-14 md:grid-cols-[1fr_1fr] md:gap-20 md:pb-20 md:pt-20" aria-labelledby="hero-title">
          {/* Full-bleed layer: spans the viewport, not just the content column */}
          <div className="pointer-events-none absolute inset-y-0 left-[calc(50%-50vw)] hidden w-screen md:block">
            <FloatingTools />
          </div>
          <div className="relative z-10 min-w-0 max-w-xl">
            <p className="rise-in mb-4 text-sm font-semibold tracking-wide text-primary" style={{ '--i': 0 } as React.CSSProperties}>A simpler developer setup</p>
            <h1 id="hero-title" className="hero-headline text-foreground">
              <span className="rise-in block" style={{ '--i': 1 } as React.CSSProperties}>Your tools.</span>
              <span className="rise-in block" style={{ '--i': 2 } as React.CSSProperties}>Your setup.</span>
              <span className="rise-in terminal-text block" style={{ '--i': 3 } as React.CSSProperties}>One install script.<span className="cursor-blink ml-1 inline-block h-[0.8em] w-[0.5em] translate-y-[0.08em] bg-primary align-baseline" aria-hidden="true" /></span>
            </h1>
            <p className="rise-in mt-5 max-w-lg text-base leading-7 text-foreground/75 sm:text-lg" style={{ '--i': 4 } as React.CSSProperties}>
              Choose your developer tools, select versions, and generate an install script for macOS or Linux.
            </p>
            <div className="rise-in mt-8 grid max-w-md grid-cols-1 gap-3 sm:grid-cols-2" style={{ '--i': 5 } as React.CSSProperties}>
              <PlatformButton os="macos" onClick={() => choosePlatform('macos')} />
              <PlatformButton os="linux" onClick={() => choosePlatform('linux')} />
            </div>
            <p className="rise-in mt-4 text-sm text-foreground/70" style={{ '--i': 6 } as React.CSSProperties}>Review your script before running it.</p>
          </div>

          <div className="rise-in relative z-10 mx-auto w-full min-w-0 max-w-lg md:max-w-none" style={{ '--i': 3 } as React.CSSProperties}>
            <HeroDemo />
          </div>
        </section>

        <LogoMarquee toolCount={appCatalog.length} />

        <section className="reveal flex flex-col gap-4 border-t border-border py-8 sm:flex-row sm:items-center sm:justify-between sm:py-9" aria-labelledby="steps-title">
          <div>
            <h2 id="steps-title" className="font-display text-lg font-semibold text-foreground">How it works</h2>
            <p className="mt-1 text-sm leading-6 text-foreground/70">See how to choose tools, review your script, and run it safely.</p>
          </div>
          <Link href="/how-it-works" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Read the setup guide
          </Link>
        </section>

        <section id="starter-stacks" className="scroll-mt-6 border-t border-border py-9 sm:py-11" aria-labelledby="stacks-title">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 id="stacks-title" className="font-display text-xl font-semibold text-foreground sm:text-2xl">Start with a stack</h2>
              <p className="mt-1 text-sm text-foreground/70">Choose a starting point. You can adjust every tool in the catalogue.</p>
            </div>
            {appliedPreset && (
              <p className="text-sm font-medium text-primary" role="status" aria-live="polite">
                Stack added. Choose macOS or Linux above to continue.
              </p>
            )}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {starterStacks.map((stack) => {
              const preset = presets.find((item) => item.id === stack.presetId);
              const selected = appliedPreset === stack.presetId;
              const exampleTools = stack.toolIds
                .map((id) => appCatalog.find((app) => app.id === id)?.name)
                .filter((name): name is string => Boolean(name));

              return (
                <article key={stack.presetId} className="reveal spotlight-card flex h-full flex-col rounded-lg border border-border bg-card p-6 shadow-soft">
                  <h3 className="text-base font-semibold text-card-foreground">{stack.title}</h3>
                  <p className="mt-1 min-h-10 text-sm leading-5 text-foreground/70">{stack.description}</p>
                  <p className="label-caps mt-4 text-muted-foreground">Example tools</p>
                  <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-sm text-foreground/80">
                    {exampleTools.map((name) => (
                      <li key={name} className="after:ml-2 after:text-muted-foreground after:content-['·'] last:after:content-none">{name}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled={!preset || selected}
                    onClick={() => {
                      if (!preset) return;
                      loadPreset(preset.packageIds);
                      setAppliedPreset(preset.id);
                    }}
                    className={`mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      selected
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border text-foreground hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    {selected && <Check className="h-4 w-4" />}
                    {selected ? 'Added to your bucket' : 'Use this preset'}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <footer className="mt-4 border-t border-border/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-5 text-xs text-foreground/65 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <a href="#boot" className="flex items-center gap-2 font-semibold text-foreground" aria-label="SudoStart home">
            <BrandMark size={26} />
          </a>
          <a href="https://github.com/The-SudoStart/sudo-start" target="_blank" rel="noreferrer" className="font-medium transition-colors hover:text-foreground">GitHub</a>
          <span>Platform support: macOS and Linux</span>
        </div>
      </footer>
    </div>
  );
}

function PlatformButton({ os, onClick }: { os: 'macos' | 'linux'; onClick: () => void }) {
  const Icon = os === 'macos' ? Apple : Monitor;
  const label = os === 'macos' ? 'macOS' : 'Linux';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        os === 'macos'
          ? 'terminal-glow press-spring border-primary bg-primary text-primary-foreground hover:brightness-110'
          : 'press-spring border-line-strong bg-card text-foreground hover:border-primary hover:text-primary'
      }`}
    >
      <Icon className="h-4 w-4" />
      Start with {label}
    </button>
  );
}
