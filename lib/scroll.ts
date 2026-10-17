import type Lenis from 'lenis';
import { INTRO_EVENT } from '@/lib/intro/timing';

export function getLenis(): Lenis | undefined {
  return (window as unknown as { lenis?: Lenis }).lenis;
}

/** Resolves once the intro overlay is gone (immediately if it never shows). */
export function whenIntroDone(): Promise<void> {
  return new Promise((resolve) => {
    if (!document.querySelector('[data-intro-root]')) return resolve();
    const done = () => {
      window.removeEventListener(INTRO_EVENT, done);
      clearTimeout(fallback);
      resolve();
    };
    // Safety net in case the event fires before we subscribe.
    const fallback = setTimeout(done, 20000);
    window.addEventListener(INTRO_EVENT, done);
  });
}
