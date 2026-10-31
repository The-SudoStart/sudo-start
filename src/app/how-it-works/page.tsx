import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Apple,
  FileCode2,
  Layers,
  MessageSquare,
  Monitor,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { BrandMark } from '@/components/brand-mark';
import { ProductShot } from '@/components/product-shot';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata: Metadata = {
  title: 'How SudoStart Works',
  description: 'Learn how to choose developer tools, generate an install script, review it, and run it on macOS or Linux.',
};

const contents = [
  { href: '#platform', label: '1. Choose a platform' },
  { href: '#tools', label: '2. Choose your tools' },
  { href: '#review', label: '3. Review your script' },
  { href: '#ai-help', label: 'AI assistance' },
  { href: '#run', label: '4. Download and run' },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 rounded-md text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="SudoStart home">
            <BrandMark size={36} />
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-4 whitespace-nowrap text-sm font-medium text-muted-foreground sm:gap-7">
            <Link href="/how-it-works" aria-current="page" className="hidden rounded-md bg-muted px-3 py-1.5 text-foreground transition-colors hover:bg-accent sm:inline">How it works</Link>
            <Link href="/" className="transition-colors hover:text-foreground">Build a setup</Link>
            <a href="https://github.com/The-SudoStart/sudo-start" target="_blank" rel="noreferrer" className="hidden transition-colors hover:text-foreground sm:inline">GitHub</a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to SudoStart
        </Link>

        <section className="mt-8 max-w-3xl" aria-labelledby="guide-title">
          <p className="label-caps text-primary">SudoStart guide</p>
          <h1 id="guide-title" className="mt-3 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">How it works</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/75 sm:text-lg">
            Build a list of the developer tools you want, choose versions, and create a script for your machine. SudoStart shows you the script before you download or run it.
          </p>
        </section>

        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <aside className="h-fit min-w-0 rounded-xl border border-border bg-card p-4 lg:sticky lg:top-6" aria-label="Guide contents">
            <p className="label-caps px-2 text-muted-foreground">On this page</p>
            <nav className="mt-3 flex gap-2 overflow-x-auto lg:flex-col">
              {contents.map((item) => (
                <a key={item.href} href={item.href} className="shrink-0 rounded-lg px-2 py-2 text-sm text-foreground/75 transition-colors hover:bg-accent hover:text-foreground">
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-5 hidden rounded-lg bg-primary/5 p-3 text-sm leading-5 text-foreground/70 lg:block">
              Nothing is installed when you make your selections. You decide when to run the script.
            </div>
          </aside>

          <div className="min-w-0 max-w-3xl space-y-5">
            <GuideStep id="platform" number="01" icon={<Monitor className="h-5 w-5" />} title="Choose your platform">
              <p>Select macOS or Linux to open the tool catalogue for your system. SudoStart uses that choice to show compatible tools and generate the appropriate install commands.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"><Apple className="h-4 w-4" /> macOS</span>
                <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"><Monitor className="h-4 w-4" /> Linux</span>
              </div>
            </GuideStep>

            <GuideStep id="tools" number="02" icon={<Layers className="h-5 w-5" />} title="Choose your tools and versions">
              <p>Browse or search the catalogue, add tools to your bucket, and choose a version where one is available. You can also start with a preset for web development, Rust, DevOps, or another workflow, then adjust the list.</p>
              <p className="mt-3">Your bucket keeps the selected packages together while you continue browsing. You can add or remove tools before generating the script.</p>
              <ProductShot name="catalog" alt="The SudoStart catalog with tool cards grouped by category, each showing its install command, and three tools added to the bucket." />
            </GuideStep>

            <GuideStep id="review" number="03" icon={<FileCode2 className="h-5 w-5" />} title="Review the generated script">
              <p>Generate the script to see the install commands for your selected tools. The review screen includes your platform, package list, selected versions, and estimates for install time and disk space.</p>
              <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Read before you run</h3>
                    <p className="mt-1 text-sm leading-6 text-foreground/70">Review the commands in the Script tab and check that the tools and versions match your intent. SudoStart does not execute the script in your browser.</p>
                  </div>
                </div>
              </div>
              <ProductShot name="script" alt="The script review screen showing package count, platform, install time, disk space and the generated bash script." />
              <p className="mt-3">On macOS, you can also view or download a Brewfile.</p>
              <div className="mt-4 rounded-lg border border-border bg-background p-4">
                <h3 className="text-sm font-semibold text-foreground">Copy a curl URL</h3>
                <p className="mt-2">Open the <strong>Curl URL</strong> tab and choose <strong>Generate Curl URL</strong>. Once it is ready, use <strong>Copy One-liner</strong> to copy a command you can paste into a terminal, or <strong>Copy URL only</strong> to copy just the share link. The link serves this script and expires after 24 hours.</p>
                <code className="mt-3 block overflow-x-auto whitespace-nowrap rounded-lg border border-term-line bg-term-bg px-3 py-2 font-mono text-xs text-term-ink sm:text-sm">bash &lt;(curl -fsSL &quot;your-share-url&quot;)</code>
              </div>
            </GuideStep>

            <section id="ai-help" className="reveal scroll-mt-6 rounded-xl border border-border bg-card p-5 shadow-soft sm:p-7" aria-labelledby="ai-help-title">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-root-soft text-root"><Sparkles className="h-5 w-5" /></span>
                <div className="min-w-0">
                  <p className="label-caps text-root">Optional assistance</p>
                  <h2 id="ai-help-title" className="mt-1 font-display text-xl font-semibold text-card-foreground sm:text-2xl">How Root AI can help</h2>
                  <p className="mt-3 text-sm leading-7 text-foreground/75 sm:text-base">SudoStart includes two AI features to help you plan your toolset and understand the generated script.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <article className="rounded-lg border border-border bg-background p-4">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-foreground"><MessageSquare className="h-4 w-4 text-root" /> Root AI chat</h3>
                  <p className="mt-2 text-sm leading-6 text-foreground/75">Open <strong>Root AI</strong> from the catalogue or script screen to ask for tool recommendations or setup advice. Root can see the names of tools already in your bucket, so suggestions can account for what you have selected. Ask explicitly when you want it to add or remove catalogue tools; supported package and version IDs are checked before changes are applied.</p>
                </article>
                <article className="rounded-lg border border-border bg-background p-4">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-foreground"><Sparkles className="h-4 w-4 text-primary" /> Explain Script</h3>
                  <p className="mt-2 text-sm leading-6 text-foreground/75">On the script screen, choose <strong>Explain Script</strong> for a streamed, plain-language summary of what your setup will install. You can regenerate the summary; SudoStart caches it in your browser for that script. The panel also includes locally generated tool/version details, estimates, known dependency and post-install notes, and security notes.</p>
                </article>
              </div>
              <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
                <h3 className="text-sm font-semibold text-foreground">AI service and data</h3>
                <p className="mt-2 text-sm leading-6 text-foreground/75">AI features use the configured Groq service. If you self-host SudoStart, configure <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">GROQ_API_KEY</code> on the server. Chat requests include your conversation and current bucket names. Script explanations send selected package details, the target OS and shell, and a preview of the first 50 script lines for the summary. The AI explains and recommends; it does not run the script.</p>
              </div>
            </section>

            <GuideStep id="run" number="04" icon={<PackageCheck className="h-5 w-5" />} title="Download and run it locally">
              <p>Download the shell script, open a terminal on the target machine, and run the command below from the folder where the file was saved:</p>
              <div className="mt-4 overflow-x-auto rounded-lg border border-term-line bg-term-bg px-4 py-3">
                <code className="whitespace-nowrap font-mono text-sm text-term-ink"><span className="text-[var(--term-string)]">$ </span>chmod +x sudo-start-setup.sh &amp;&amp; ./sudo-start-setup.sh</code>
              </div>
              <p className="mt-3">The script installs the tools using their platform-specific package commands. Add <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">--verbose</code> when running it to see more detailed output.</p>
            </GuideStep>

            <section className="rounded-xl border border-primary/25 bg-primary/5 p-5 sm:p-6" aria-labelledby="ready-title">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 id="ready-title" className="text-lg font-semibold text-foreground">Ready to build your setup?</h2>
                  <p className="mt-1 text-sm leading-6 text-foreground/70">Choose your platform and start adding tools to your bucket.</p>
                </div>
                <Link href="/" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  Start with SudoStart <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-5 text-xs text-foreground/65 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground" aria-label="SudoStart home">
            <BrandMark size={26} />
          </Link>
          <a href="https://github.com/The-SudoStart/sudo-start" target="_blank" rel="noreferrer" className="font-medium transition-colors hover:text-foreground">GitHub</a>
          <span>Platform support: macOS and Linux</span>
        </div>
      </footer>
    </div>
  );
}

function GuideStep({
  id,
  number,
  icon,
  title,
  children,
}: {
  id: string;
  number: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="reveal scroll-mt-6 rounded-xl border border-border bg-card p-5 shadow-soft sm:p-7" aria-labelledby={`${id}-title`}>
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bios-soft text-primary">{icon}</span>
        <div className="min-w-0">
          <p className="label-caps text-primary">Step {number}</p>
          <h2 id={`${id}-title`} className="mt-1 font-display text-xl font-semibold text-card-foreground sm:text-2xl">{title}</h2>
          <div className="mt-3 text-sm leading-7 text-foreground/75 sm:text-base">{children}</div>
        </div>
      </div>
    </section>
  );
}
