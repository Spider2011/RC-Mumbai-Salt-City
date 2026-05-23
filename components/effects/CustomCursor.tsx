'use client';

import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Spring-following custom cursor: 12px glass circle + inner dot.
 * On interactive hover, outer scales to 40px and inner dot fades.
 * Disabled on touch devices and when reduced motion is requested.
 */
export function CustomCursor() {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  const springConfig = { stiffness: 500, damping: 40, mass: 0.6 };
  const outerX = useSpring(x, springConfig);
  const outerY = useSpring(y, springConfig);
  const innerX = useSpring(x, { stiffness: 900, damping: 50 });
  const innerY = useSpring(y, { stiffness: 900, damping: 50 });

  useEffect(() => {
    // Only enable on devices with a fine pointer (mouse)
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer || reduceMotion) return;

    // Enabling only after confirming a fine pointer exists (client-only capability check).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true);
    document.body.classList.add('has-custom-cursor');

    function move(e: MouseEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target as HTMLElement;
      const interactive = target.closest('a, button, [role="button"], input, textarea, select, label');
      setHovering(Boolean(interactive));
    }

    window.addEventListener('mousemove', move);
    return () => {
      window.removeEventListener('mousemove', move);
      document.body.classList.remove('has-custom-cursor');
    };
  }, [x, y, reduceMotion]);

  if (!enabled) return null;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[50] rounded-full border border-[var(--accent-gold)]/60 mix-blend-difference"
        style={{
          x: outerX,
          y: outerY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: hovering ? 40 : 24,
          height: hovering ? 40 : 24,
          opacity: hovering ? 0.8 : 0.5,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />
      {/* Inner dot */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[50] h-1.5 w-1.5 rounded-full bg-[var(--accent-gold)]"
        style={{
          x: innerX,
          y: innerY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{ opacity: hovering ? 0 : 1, scale: hovering ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}
