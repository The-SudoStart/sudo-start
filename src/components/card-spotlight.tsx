'use client';

import { useEffect } from 'react';

/** Maximum tilt toward the pointer, in degrees. */
const TILT = 4;

/**
 * One delegated pointer listener for every `.spotlight-card` on the page.
 * It writes the pointer position (--mx / --my) for the glow, and a small
 * tilt (--rx / --ry) for mouse and pen. Touch gets the glow on press only.
 * Mounted once in the root layout; renders nothing.
 */
export function CardSpotlight() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let active: HTMLElement | null = null;
    let frame = 0;

    const reset = (el: HTMLElement) => {
      el.style.removeProperty('--rx');
      el.style.removeProperty('--ry');
      el.classList.remove('is-pointing');
    };

    const track = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest<HTMLElement>('.spotlight-card') ?? null;
      if (active && active !== card) reset(active);
      active = card;
      if (!card) return;

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
        card.classList.add('is-pointing');
        if (e.pointerType !== 'touch' && !reduce.matches) {
          card.style.setProperty('--rx', `${((0.5 - y / rect.height) * TILT).toFixed(2)}deg`);
          card.style.setProperty('--ry', `${((x / rect.width - 0.5) * TILT).toFixed(2)}deg`);
        }
      });
    };

    // Touch: light up where the finger lands, fade out once it lifts.
    const release = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && active) {
        const card = active;
        window.setTimeout(() => reset(card), 450);
        active = null;
      }
    };

    const leave = () => {
      if (active) reset(active);
      active = null;
    };

    document.addEventListener('pointermove', track, { passive: true });
    document.addEventListener('pointerdown', track, { passive: true });
    document.addEventListener('pointerup', release, { passive: true });
    document.addEventListener('pointercancel', release, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', track);
      document.removeEventListener('pointerdown', track);
      document.removeEventListener('pointerup', release);
      document.removeEventListener('pointercancel', release);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, []);

  return null;
}
