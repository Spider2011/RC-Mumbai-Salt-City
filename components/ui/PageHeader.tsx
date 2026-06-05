'use client';

import { motion, useScroll, useTransform, useReducedMotion, type Variants } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { Eyebrow } from './Eyebrow';
import { fadeUp, staggerContainer } from '@/lib/motion';
import { FloatingSparkles } from '@/components/effects/FloatingSparkles';

interface PageHeaderProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  sanskrit?: string;
}

// 3D title entrance — rises from below with depth perspective.
const title3D: Variants = {
  hidden: { opacity: 0, y: 48, rotateX: -28, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * Hero header for inner pages — accounts for the fixed navbar, layers a
 * Devanagari watermark, drifts sparkles, and parallax-shifts the title on scroll.
 */
export function PageHeader({ eyebrow, title, subtitle, sanskrit }: PageHeaderProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // Scroll-driven parallax — watermark drifts up faster than title.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const watermarkY = useTransform(scrollYProgress, [0, 1], ['0%', '-40%']);
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <header
      ref={ref}
      className="relative overflow-hidden pb-12 pt-36 md:pt-44"
      style={{ perspective: 1400 }}
    >
      {/* Ambient gradient backdrop */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 70% at 50% 0%, rgba(132,94,194,0.14), transparent 60%), radial-gradient(ellipse 60% 40% at 80% 30%, rgba(255,169,77,0.06), transparent 60%)',
        }}
      />

      {/* Drifting sparkles behind content */}
      <FloatingSparkles count={10} className="absolute inset-0 z-[1]" />

      {/* Parallax Devanagari watermark */}
      {sanskrit && (
        <motion.span
          aria-hidden
          style={reduceMotion ? undefined : { y: watermarkY }}
          className="font-sanskrit pointer-events-none absolute -top-4 left-1/2 z-[2] -translate-x-1/2 text-[clamp(5rem,18vw,14rem)] leading-none text-[var(--text-primary)]/[0.04]"
        >
          {sanskrit}
        </motion.span>
      )}

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={reduceMotion ? undefined : { y: titleY, opacity: titleOpacity }}
        className="relative z-[3] mx-auto max-w-4xl px-6 text-center"
      >
        <motion.div variants={fadeUp} className="flex justify-center">
          <Eyebrow>{eyebrow}</Eyebrow>
        </motion.div>
        <motion.h1
          variants={title3D}
          style={{ transformStyle: 'preserve-3d', transformOrigin: '50% 100%' }}
          className="font-display mt-5 text-[clamp(2.5rem,7vw,5rem)] font-light leading-[1.05] text-[var(--text-primary)]"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg"
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </header>
  );
}
