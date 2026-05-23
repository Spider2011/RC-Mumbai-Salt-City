'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { pageVariants, shutterVariants } from '@/lib/motion';

/**
 * Wraps page content in AnimatePresence (mode="wait").
 * Outgoing: fade + scale down + blur. Incoming: fade + scale + glass shutter wipe.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative"
      >
        {/* Glass shutter wipe */}
        <motion.div
          aria-hidden
          variants={shutterVariants}
          className="pointer-events-none fixed inset-0 z-[40] origin-top glass-heavy"
        />
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
