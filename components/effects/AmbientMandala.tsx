'use client';

import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { Mandala } from './Mandala';

/**
 * Persistent sitewide visual anchor — fixed top-right, ~4% opacity,
 * continuously rotating via CSS. Scroll velocity adds a few degrees of
 * extra rotation on top (spring settles to 0 when scrolling stops).
 * Easter egg: clicking it 7 times reveals the Īśopaniṣad shloka.
 */
export function AmbientMandala() {
  const reduceMotion = useReducedMotion();
  const clicks = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const scrollRotate = useSpring(useTransform(velocity, [-2500, 2500], [-14, 14]), {
    stiffness: 90,
    damping: 24,
    mass: 0.6,
  });

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
      <motion.div
        className="h-full w-full"
        style={reduceMotion ? undefined : { rotate: scrollRotate }}
      >
        <Mandala duration={150} onClick={handleClick} />
      </motion.div>
    </div>
  );
}
