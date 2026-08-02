'use client';

import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Spring-following custom cursor: a gold reticle ring + glow halo + center dot.
 * Uses a dual dark/gold outline (not mix-blend) so it stays visible on any
 * background, and sits at z-[9999] so it renders above overlays like the
 * gallery lightbox. On interactive hover the ring grows and the dot hides.
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
      {/* Soft glow halo — presence on dark backgrounds */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full"
        style={{
          x: outerX,
          y: outerY,
          translateX: '-50%',
          translateY: '-50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.35) 0%, transparent 70%)',
        }}
        animate={{
          width: hovering ? 64 : 36,
          height: hovering ? 64 : 36,
          opacity: hovering ? 0.9 : 0.55,
        }}
        transition={{ type: 'spring', stiffness: 250, damping: 26 }}
      />

      {/* Gold reticle ring — dual dark/gold outline stays visible on any bg */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full border-[1.5px] border-[var(--accent-gold)]"
        style={{
          x: outerX,
          y: outerY,
          translateX: '-50%',
          translateY: '-50%',
          boxShadow: '0 0 0 1px rgba(10,14,26,0.5), 0 0 12px rgba(212,175,55,0.5)',
          backgroundColor: hovering ? 'rgba(212,175,55,0.12)' : 'transparent',
        }}
        animate={{
          width: hovering ? 44 : 26,
          height: hovering ? 44 : 26,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />

      {/* Snappy center dot — dark ring keeps it visible on light photos */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full bg-[var(--accent-gold)]"
        style={{
          x: innerX,
          y: innerY,
          translateX: '-50%',
          translateY: '-50%',
          boxShadow: '0 0 0 1.5px rgba(10,14,26,0.45), 0 0 8px rgba(212,175,55,0.7)',
        }}
        animate={{ opacity: hovering ? 0 : 1, scale: hovering ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}
