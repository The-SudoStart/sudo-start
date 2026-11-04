'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Code2, Container, Database } from 'lucide-react';
import { AppIcon } from '@/components/app-icon';

const RustBrandIcon = ({ className = '' }: { className?: string; strokeWidth?: number }) => (
  <AppIcon id="rust" name="Rust" size={28} className={className} />
);

// Each preview tool shows its category family tint (see categories.tsx).
const previewTools = [
  { id: 'vscode', name: 'VS Code', detail: 'IDEs', Icon: Code2, family: 'fam-code' },
  { id: 'docker', name: 'Docker', detail: 'Containers', Icon: Container, family: 'fam-infra' },
  { id: 'postgresql', name: 'PostgreSQL', detail: 'Databases', Icon: Database, family: 'fam-data' },
  { id: 'rust', name: 'Rust', detail: 'Runtimes', Icon: RustBrandIcon, family: 'fam-code' },
];

type Seg = [kind: 'out' | 'dim' | 'kw' | 'str' | 'cmd' | 'var' | 'info' | 'ok', text: string];

/**
 * One run of the demo. Mirrors the generated script's real output
 * (`log` prints "[SudoStart] …", `ok` prints "✓ …"). `typed` lines are typed
 * out character by character; `start` / `done` mark a tool row as installing
 * or installed when the line appears; `pause` is the wait after the line (ms).
 */
const script: { segs: Seg[]; typed?: boolean; start?: number; done?: number; pause: number }[] = [
  { segs: [['str', '$ '], ['out', './sudo-start-setup.sh']], typed: true, pause: 500 },
  { segs: [['info', '[SudoStart] '], ['out', 'Homebrew found, skipping install']], pause: 450 },
  { segs: [['info', '[SudoStart] '], ['out', 'Installing Visual Studio Code...']], start: 0, pause: 900 },
  { segs: [['ok', '  ✓ '], ['out', 'Visual Studio Code installed']], done: 0, pause: 350 },
  { segs: [['info', '[SudoStart] '], ['out', 'Installing Docker...']], start: 1, pause: 1000 },
  { segs: [['ok', '  ✓ '], ['out', 'Docker installed']], done: 1, pause: 350 },
  { segs: [['info', '[SudoStart] '], ['out', 'Installing PostgreSQL...']], start: 2, pause: 800 },
  { segs: [['ok', '  ✓ '], ['out', 'PostgreSQL installed']], done: 2, pause: 350 },
  { segs: [['info', '[SudoStart] '], ['out', 'Installing Rust...']], start: 3, pause: 1100 },
  { segs: [['ok', '  ✓ '], ['out', 'Rust installed']], done: 3, pause: 450 },
  { segs: [['ok', '[ OK ] '], ['out', '4 tools ready in 5m 42s']], pause: 4200 },
];

const VISIBLE_LINES = 6;
const TYPE_SPEED = 45;

const segColor: Record<Seg[0], string> = {
  out: 'var(--term-ink)',
  dim: 'var(--term-dim)',
  kw: 'var(--term-keyword)',
  str: 'var(--term-string)',
  cmd: 'var(--term-command)',
  var: 'var(--term-variable)',
  info: 'var(--term-keyword)',
  ok: 'var(--term-string)',
};

const fullLength = (segs: Seg[]) => segs.reduce((n, [, t]) => n + t.length, 0);

/** Render a line's segments, cut to the first `chars` characters. */
function renderSegs(segs: Seg[], chars = Infinity) {
  let left = chars;
  return segs.map(([kind, text], i) => {
    if (left <= 0) return null;
    const part = text.slice(0, left);
    left -= text.length;
    return <span key={i} style={{ color: segColor[kind] }}>{part}</span>;
  });
}

export function HeroDemo() {
  // `line` = index of the line being shown; `chars` = typed characters on it.
  const [line, setLine] = useState(script.length - 1);
  const [chars, setChars] = useState(Infinity);
  const [running, setRunning] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Start only when motion is allowed and the card is on screen. Until then
  // (and for reduced motion, and on the server) the finished run is shown.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      // Restart from the first line each time the card comes into view.
      if (entry.isIntersecting) {
        setLine(0);
        setChars(0);
      }
      setRunning(entry.isIntersecting);
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const current = script[line];
    const total = fullLength(current.segs);
    let timer: ReturnType<typeof setTimeout>;
    if (current.typed && chars < total) {
      timer = setTimeout(() => setChars((c) => c + 1), TYPE_SPEED);
    } else {
      timer = setTimeout(() => {
        const next = (line + 1) % script.length;
        setLine(next);
        setChars(script[next].typed ? 0 : Infinity);
      }, current.pause);
    }
    return () => clearTimeout(timer);
  }, [running, line, chars]);

  // Tool row state from the lines shown so far.
  const shown = script.slice(0, line + 1);
  const installed = new Set(shown.flatMap((l) => (l.done !== undefined ? [l.done] : [])));
  const installing = new Set(shown.flatMap((l) => (l.start !== undefined && !installed.has(l.start) ? [l.start] : [])));
  const finished = line === script.length - 1;
  const firstVisible = Math.max(0, line + 1 - VISIBLE_LINES);

  return (
    <div ref={rootRef} className="overflow-hidden rounded-[20px] border border-border bg-card shadow-[var(--shadow-3)]">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-card-foreground">Your toolset</p>
          <p className="mt-0.5 text-xs text-foreground/70">A sample setup</p>
        </div>
        <span className="rounded-full bg-bios-soft px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-primary">
          {installed.size}/{previewTools.length} installed
        </span>
      </div>
      <ul className="divide-y divide-border px-5">
        {previewTools.map((tool, i) => {
          const state = installed.has(i) ? 'done' : installing.has(i) ? 'run' : 'wait';
          return (
            <li key={tool.id} className="flex items-center gap-4 py-4">
              <span className={`fam-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${tool.family}`} aria-hidden="true">
                <tool.Icon className="h-5 w-5" strokeWidth={2.1} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-card-foreground">{tool.name}</p>
                <p className="text-xs text-foreground/70">{tool.detail}</p>
              </div>
              {state === 'done' && (
                <span className="hero-demo-pop flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-label="Installed">
                  <Check className="h-3 w-3" />
                </span>
              )}
              {state === 'run' && <span className="status-tag status-info cursor-blink">RUN</span>}
              {state === 'wait' && <span className="h-5 w-5 rounded-full border-2 border-dashed border-line-strong" aria-label="Waiting" />}
            </li>
          );
        })}
      </ul>
      <div className="border-t border-term-line bg-term-bg" aria-label="Example install output">
        <div className="flex items-center justify-between border-b border-term-line px-5 py-2 font-mono text-[11.5px] text-term-dim">
          <span>
            <span style={{ color: 'var(--term-string)' }}>#</span> sudo-start-setup.sh
          </span>
          <span className="tabular-nums">~6 min · 2.1 GB</span>
        </div>
        <div
          className="flex flex-col justify-end overflow-hidden px-5 py-3 font-mono text-[12.5px] leading-[21px]"
          style={{ height: VISIBLE_LINES * 21 + 24 }}
          aria-live="off"
        >
          {script.slice(firstVisible, line + 1).map((l, i) => {
            const index = firstVisible + i;
            const isCurrent = index === line;
            return (
              <p key={index} className="truncate whitespace-pre">
                {renderSegs(l.segs, isCurrent ? chars : Infinity)}
                {isCurrent && l.typed && <span className="hero-demo-caret" style={{ background: 'var(--term-string)' }} />}
              </p>
            );
          })}
          {finished && (
            <p className="whitespace-pre">
              {/* From $ to #: the run ends at a root prompt */}
              <span style={{ color: 'var(--term-string)' }}># </span>
              <span className="hero-demo-caret cursor-blink" style={{ background: 'var(--term-string)' }} />
            </p>
          )}
        </div>
      </div>
      <p className="border-t border-border px-5 py-3 text-xs text-foreground/65">Illustrative preview</p>
    </div>
  );
}
