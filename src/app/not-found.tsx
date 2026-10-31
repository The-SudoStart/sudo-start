import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';
import { CubeLoader } from '@/components/cube-loader';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-background">
      <div className="hero-wash pointer-events-none absolute inset-x-0 top-0 h-[36rem]" aria-hidden="true" />
      <header className="relative mx-auto flex w-full max-w-7xl items-center px-5 py-5 sm:px-8">
        <Link href="/" aria-label="SudoStart home" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <BrandMark size={36} />
        </Link>
      </header>

      <main className="relative mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 pb-24 text-center">
        <div className="rise-in">
          <CubeLoader size={88} label="SudoStart cube" />
        </div>
        <p className="rise-in label-caps mt-10 text-primary" style={{ '--i': 1 } as React.CSSProperties}>Error 404</p>
        <h1 className="rise-in mt-3 font-display text-4xl font-bold text-foreground sm:text-5xl" style={{ '--i': 2 } as React.CSSProperties}>
          Command not found
        </h1>
        <div
          className="rise-in mt-6 w-full overflow-x-auto rounded-lg border border-term-line bg-term-bg px-4 py-3 text-left font-mono text-[13px] leading-[21px] text-term-ink"
          style={{ '--i': 3 } as React.CSSProperties}
        >
          <p><span className="text-[var(--term-string)]">$</span> cd /this-page</p>
          <p className="text-term-dim">bash: cd: /this-page: No such file or directory</p>
        </div>
        <p className="rise-in mt-5 text-sm leading-6 text-muted-foreground" style={{ '--i': 4 } as React.CSSProperties}>
          This page doesn&apos;t exist, or it moved. Head back and build your setup from the start.
        </p>
        <Link
          href="/"
          className="rise-in terminal-glow press-spring mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
          style={{ '--i': 5 } as React.CSSProperties}
        >
          Back to SudoStart
        </Link>
      </main>
    </div>
  );
}
