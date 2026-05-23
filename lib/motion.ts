/**
 * Centralized Framer Motion variants & transitions for RCMSC
 * Import from here — never define variants inline across pages.
 */

import type { Variants, Transition } from 'framer-motion';

// ─── Spring Configs ─────────────────────────────────────────────────────────

export const springGentle: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 30,
};

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 20,
};

export const springBouncy: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 15,
};

export const easeCinematic: Transition = {
  duration: 0.9,
  ease: [0.16, 1, 0.3, 1], // expo out
};

export const easeFast: Transition = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1],
};

// ─── Page Transitions ────────────────────────────────────────────────────────

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 1.02,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    filter: 'blur(4px)',
    transition: { duration: 0.4, ease: [0.7, 0, 0.84, 0] },
  },
};

// Glass shutter wipe on page enter
export const shutterVariants: Variants = {
  initial: { scaleY: 1, originY: 0 },
  animate: {
    scaleY: 0,
    transition: { duration: 0.6, ease: [0.7, 0, 0.84, 0], delay: 0.1 },
  },
  exit: {
    scaleY: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─── Scroll Reveal ───────────────────────────────────────────────────────────

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: easeCinematic,
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: easeCinematic,
  },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: easeCinematic,
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: easeCinematic,
  },
};

// ─── Stagger Containers ──────────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

export const staggerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

// ─── Hero Orchestration ──────────────────────────────────────────────────────

export const heroContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.3,
    },
  },
};

export const heroParticles: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1.5, ease: 'easeOut', delay: 0 },
  },
};

export const heroMandala: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 },
  },
};

export const heroSanskrit: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut', delay: 0.6 },
  },
};

export const heroHeadline: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.9 },
  },
};

export const heroSub: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: 'easeOut', delay: 1.2 },
  },
};

export const heroNav: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 1.5 },
  },
};

// ─── Hover & Gesture Physics ─────────────────────────────────────────────────

export const glassHover = {
  scale: 1.02,
  y: -4,
  transition: springSnappy,
};

export const glassTap = {
  scale: 0.97,
  transition: springBouncy,
};

export const buttonHover = {
  scale: 1.03,
  transition: springSnappy,
};

export const buttonTap = {
  scale: 0.96,
  transition: springBouncy,
};

// ─── Continuous Loops ────────────────────────────────────────────────────────

export const mandalaRotate = {
  animate: {
    rotate: 360,
    transition: {
      duration: 120,
      repeat: Infinity,
      ease: 'linear' as const,
    },
  },
};

export const mandalaRotateSlow = {
  animate: {
    rotate: 360,
    transition: {
      duration: 180,
      repeat: Infinity,
      ease: 'linear' as const,
    },
  },
};

export const breatheGlow = {
  animate: {
    scale: [1, 1.04, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

export const floatDrift = {
  animate: {
    y: [0, -12, -6, -18, 0],
    x: [0, 6, -8, 4, 0],
    transition: {
      duration: 12,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

export const scrollIndicator = {
  animate: {
    y: [0, 8, 0],
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

// ─── SVG Path Drawing ────────────────────────────────────────────────────────

export const drawPath: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 2, ease: 'easeInOut' },
      opacity: { duration: 0.4 },
    },
  },
};

export const drawPathFast: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.2, ease: 'easeInOut' },
      opacity: { duration: 0.3 },
    },
  },
};

// ─── Loader ──────────────────────────────────────────────────────────────────

export const loaderExit: Variants = {
  visible: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: { duration: 0.6, ease: 'easeOut', delay: 0.2 },
  },
};
