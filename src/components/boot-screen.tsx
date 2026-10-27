'use client';

import { useStore } from '@/lib/store';
import { appCatalog } from '@/lib/apps';
import { presets } from '@/lib/presets';
import { OS } from '@/types';
import { Apple, Check, Code2, Container, GitBranch, Monitor, Terminal, Cog } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

const previewTools = [
  { id: 'vscode', name: 'VS Code', detail: 'Code editor', Icon: Code2, color: 'text-foreground', surface: 'bg-muted' },
  { id: 'git', name: 'Git', detail: 'Version control', Icon: GitBranch, color: 'text-foreground', surface: 'bg-muted' },
  { id: 'docker', name: 'Docker', detail: 'Containers', Icon: Container, color: 'text-foreground', surface: 'bg-muted' },
  { id: 'rust', name: 'Rust', detail: 'Programming language', Icon: Cog, color: 'text-foreground', surface: 'bg-muted' },
];

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
    <div className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="#boot" className="flex items-center gap-2.5 rounded-md text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="SudoStart home">
          <span className="app-icon-tile flex h-9 w-9 items-center justify-center rounded-lg"><Terminal className="h-5 w-5" /></span>
          <span className="text-base font-bold tracking-tight">SudoStart</span>
        </a>
        <nav aria-label="Main navigation" className="flex items-center gap-5 text-sm font-medium text-muted-foreground sm:gap-7">
          <Link href="/how-it-works" className="transition-colors hover:text-foreground">How it works</Link>
          <a href="https://github.com/The-SudoStart/sudo-start" target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground">GitHub</a>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 sm:px-8">
        <section className="grid items-center gap-12 pb-12 pt-10 sm:pb-16 sm:pt-14 md:grid-cols-[1fr_1fr] md:gap-20 md:pb-20 md:pt-20" aria-labelledby="hero-title">
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-semibold tracking-wide text-primary">A simpler developer setup</p>
            <h1 id="hero-title" className="hero-headline text-foreground">
              <span className="block">Your tools.</span>
              <span className="block">Your setup.</span>
              <span className="terminal-text block">One install script.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-foreground/75 sm:text-lg">
              Choose your developer tools, select versions, and generate an install script for macOS or Linux.
            </p>
            <div className="mt-8 grid max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
              <PlatformButton os="macos" onClick={() => choosePlatform('macos')} />
              <PlatformButton os="linux" onClick={() => choosePlatform('linux')} />
            </div>
            <p className="mt-4 text-sm text-foreground/70">Review your script before running it.</p>
          </div>

          <div className="mx-auto w-full max-w-lg md:max-w-none">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-card-foreground">Your toolset</p>
                  <p className="mt-0.5 text-xs text-foreground/70">A sample setup</p>
                </div>
                <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">4 tools selected</span>
              </div>
              <ul className="divide-y divide-border px-5">
                {previewTools.map((tool) => (
                  <li key={tool.id} className="flex items-center gap-4 py-4">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${tool.surface} ${tool.color}`} aria-hidden="true">
                      <tool.Icon className="h-5 w-5" strokeWidth={2.1} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-card-foreground">{tool.name}</p>
                      <p className="text-xs text-foreground/70">{tool.detail}</p>
                    </div>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-label="Selected"><Check className="h-3 w-3" /></span>
                  </li>
                ))}
              </ul>
              <p className="border-t border-border px-5 py-3 text-xs text-foreground/65">Illustrative preview</p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 border-t border-border py-8 sm:flex-row sm:items-center sm:justify-between sm:py-9" aria-labelledby="steps-title">
          <div>
            <h2 id="steps-title" className="text-lg font-semibold tracking-tight text-foreground">How it works</h2>
            <p className="mt-1 text-sm leading-6 text-foreground/70">See how to choose tools, review your script, and run it safely.</p>
          </div>
          <Link href="/how-it-works" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Read the setup guide
          </Link>
        </section>

        <section id="starter-stacks" className="scroll-mt-6 border-t border-border py-9 sm:py-11" aria-labelledby="stacks-title">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 id="stacks-title" className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Start with a stack</h2>
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
                <article key={stack.presetId} className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-soft">
                  <h3 className="text-base font-semibold text-card-foreground">{stack.title}</h3>
                  <p className="mt-1 min-h-10 text-sm leading-5 text-foreground/70">{stack.description}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Example tools</p>
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
            <span className="app-icon-tile flex h-7 w-7 items-center justify-center rounded-md"><Terminal className="h-4 w-4" /></span>
            SudoStart
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
          ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
          : 'border-border bg-transparent text-foreground hover:border-muted-foreground/60 hover:bg-accent'
      }`}
    >
      <Icon className="h-4 w-4" />
      Start with {label}
    </button>
  );
}
