'use client';

import { useEffect } from 'react';

const FULL_SPEED = 40; // px per frame that maps to full intensity
const JUMP = 300; // px per frame: larger moves are programmatic jumps, not scrolling

/**
 * Publishes scroll speed as `--sv` (signed, -1..1) and `--sva` (magnitude) on
 * <html>; globals.css turns them into image stretch and heading RGB split.
 * Runs a rAF loop only while the page is moving.
 */
export function ScrollVelocity() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = document.documentElement;
    let raf = 0;
    let current = 0;
    let lastY = window.scrollY;
    let written = '';

    const write = (v: number) => {
      const s = v.toFixed(3);
      if (s === written) return;
      written = s;
      root.style.setProperty('--sv', s);
      root.style.setProperty('--sva', Math.abs(v).toFixed(3));
    };

    // Per-frame movement works for both Lenis (desktop) and native touch scrolling.
    const tick = () => {
      const y = window.scrollY;
      let raw = y - lastY;
      lastY = y;
      if (Math.abs(raw) > JUMP) raw = 0;

      const target = Math.max(-1, Math.min(1, raw / FULL_SPEED));
      current += (target - current) * 0.18;

      if (Math.abs(current) < 0.002 && target === 0) {
        current = 0;
        write(0);
        raf = 0;
        return;
      }
      write(current);
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
      root.style.removeProperty('--sv');
      root.style.removeProperty('--sva');
    };
  }, []);

  return null;
}
