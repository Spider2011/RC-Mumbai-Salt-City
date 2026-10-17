'use client';

import { useEffect, useRef } from 'react';
import { Hero } from '@/components/sections/Hero';
import { getLenis } from '@/lib/scroll';

/**
 * "The End Is The Beginning": a mirror of the hero sits after the footer. Once
 * it reaches the top of the viewport it looks exactly like the page at scroll
 * 0, so we jump there and keep any remaining scroll momentum.
 */
export function EndlessLoop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let jumping = false;
    let mirrorTop = Infinity;

    // Layout offsets ignore the page-transition transform, unlike getBoundingClientRect.
    const measure = () => {
      let top = 0;
      for (let e: HTMLElement | null = el; e; e = e.offsetParent as HTMLElement | null) {
        top += e.offsetTop;
      }
      mirrorTop = top;
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(document.body);

    const onScroll = () => {
      if (jumping) return;
      const overshoot = window.scrollY - mirrorTop;
      if (overshoot < -1) return;
      jumping = true;

      const target = Math.max(0, overshoot);
      const lenis = getLenis();
      if (lenis) {
        const momentum = lenis.targetScroll - lenis.animatedScroll;
        lenis.scrollTo(target, { immediate: true, force: true });
        if (momentum > 1) lenis.scrollTo(target + momentum, { force: true });
      } else {
        window.scrollTo(0, target);
      }
      requestAnimationFrame(() => {
        jumping = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={ref} data-loop-mirror="">
      <Hero mirror />
    </div>
  );
}
