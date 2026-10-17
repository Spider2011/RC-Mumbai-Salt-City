'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { whenIntroDone } from '@/lib/scroll';

// Three.js is only fetched once this actually renders.
const BoatScene = dynamic(() => import('./BoatScene'), { ssr: false });

const QUERY = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';

/** The 3D paper boat that sails the homepage river, on desktop after the intro. */
export function PaperBoatGuide() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    let introDone = false;
    let cancelled = false;
    const sync = () => setEnabled(introDone && mq.matches);

    whenIntroDone().then(() => {
      if (cancelled) return;
      introDone = true;
      sync();
    });
    mq.addEventListener('change', sync);
    return () => {
      cancelled = true;
      mq.removeEventListener('change', sync);
    };
  }, []);

  return enabled ? <BoatScene /> : null;
}
