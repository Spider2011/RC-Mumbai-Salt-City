'use client';

import { useRef } from 'react';
import { Mandala } from './Mandala';

/**
 * Persistent sitewide visual anchor — fixed top-right, ~4% opacity,
 * continuously rotating. The cyclical heartbeat of the site.
 * Easter egg: clicking it 7 times reveals the Īśopaniṣad shloka.
 */
export function AmbientMandala() {
  const clicks = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleClick() {
    clicks.current += 1;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      clicks.current = 0;
    }, 2000);

    if (clicks.current >= 7) {
      window.dispatchEvent(new Event('triggerShloka'));
      clicks.current = 0;
    }
  }

  return (
    <div className="ambient-mandala pointer-events-auto">
      <Mandala duration={150} onClick={handleClick} />
    </div>
  );
}
