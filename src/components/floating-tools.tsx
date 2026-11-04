'use client';

import { useEffect, useRef } from 'react';
import { AppIcon } from './app-icon';

type Depth = 'near' | 'mid' | 'far';

/**
 * Tool tiles that drift behind the landing hero at three depths. Positions
 * keep clear of the headline and the preview panel; far tiles are hidden on
 * small screens. `edge` tiles sit in the page margins and only show on wide
 * screens, where the margins keep them clear of the hero text. Parallax
 * follows the pointer on fine-pointer devices only.
 */
const tiles: { id: string; name: string; family: string; depth: Depth; pos: React.CSSProperties; delay: number; edge?: boolean }[] = [
  { id: 'docker', name: 'Docker', family: 'fam-infra', depth: 'near', pos: { left: '3%', top: '12%' }, delay: 0, edge: true },
  { id: 'deno', name: 'Deno', family: 'fam-code', depth: 'mid', pos: { left: '2.5%', top: '70%' }, delay: 1.4, edge: true },
  { id: 'git', name: 'Git', family: 'fam-code', depth: 'far', pos: { left: '29%', top: '3%' }, delay: 2.2 },
  { id: 'rust', name: 'Rust', family: 'fam-code', depth: 'far', pos: { left: '40%', top: '8%' }, delay: 0.6 },
  { id: 'terraform', name: 'Terraform', family: 'fam-infra', depth: 'mid', pos: { left: '24%', top: '90%' }, delay: 3.1 },
  { id: 'go', name: 'Go', family: 'fam-code', depth: 'far', pos: { left: '48%', top: '78%' }, delay: 1.9 },
  { id: 'nodejs', name: 'Node.js', family: 'fam-code', depth: 'near', pos: { left: '54%', top: '5%' }, delay: 0.9 },
  { id: 'postgresql', name: 'PostgreSQL', family: 'fam-data', depth: 'near', pos: { right: '3%', top: '9%' }, delay: 2.6, edge: true },
  { id: 'redis', name: 'Redis', family: 'fam-data', depth: 'mid', pos: { right: '3%', top: '80%' }, delay: 0.3, edge: true },
  { id: 'podman', name: 'Podman', family: 'fam-infra', depth: 'far', pos: { right: '16%', top: '93%' }, delay: 1.1 },
  { id: 'neovim', name: 'Neovim', family: 'fam-system', depth: 'mid', pos: { left: '50%', top: '42%' }, delay: 2.9 },
];

const depthStyle: Record<Depth, { size: number; shift: number; className: string }> = {
  near: { size: 60, shift: 18, className: 'opacity-90' },
  mid: { size: 50, shift: 10, className: 'opacity-70' },
  far: { size: 42, shift: 5, className: 'hidden opacity-45 blur-[0.5px] md:block' },
};

export function FloatingTools() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (reduce || !fine) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // -1..1 from the viewport centre
        layer.style.setProperty('--px', ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        layer.style.setProperty('--py', ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div ref={layerRef} className="floating-tools pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {tiles.map((tile) => {
        const d = depthStyle[tile.depth];
        return (
          <div
            key={tile.id}
            className={`floating-tile-parallax absolute ${d.className} ${tile.edge ? 'max-[1359px]:hidden' : ''}`}
            style={{ ...tile.pos, '--shift': `${d.shift}px` } as React.CSSProperties}
          >
            <div
              className={`floating-tile ${tile.family} fam-tile flex items-center justify-center rounded-[14px] border border-border shadow-[var(--shadow-2)]`}
              style={{ width: d.size, height: d.size, animationDelay: `-${tile.delay}s` }}
            >
              <AppIcon id={tile.id} name={tile.name} size={Math.round(d.size * 0.8)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
