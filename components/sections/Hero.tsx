'use client';

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { Mandala } from '@/components/effects/Mandala';
import { ParticleField } from '@/components/effects/ParticleField';
import { GlassButton } from '@/components/ui/GlassButton';
import { SITE } from '@/lib/constants';
import {
  heroContainer,
  heroParticles,
  heroMandala,
  heroSanskrit,
  heroHeadline,
  heroSub,
  scrollIndicator,
} from '@/lib/motion';

export function Hero() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Parallax layers
  const mandalaY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const mandalaScale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '120%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const particleY = useTransform(scrollYProgress, [0, 1], ['0%', '70%']);

  function scrollToNext() {
    const lenis = (window as typeof window & { lenis?: { scrollTo: (t: number) => void } }).lenis;
    const target = window.innerHeight;
    if (lenis) lenis.scrollTo(target);
    else window.scrollTo({ top: target, behavior: 'smooth' });
  }

  return (
    <section
      ref={ref}
      className="relative flex min-h-dvh items-center justify-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background gradient */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 120% 80% at 50% 0%, #1A1F35 0%, #0A0E1A 60%), radial-gradient(circle at 80% 90%, rgba(132,94,194,0.15), transparent 50%), radial-gradient(circle at 20% 80%, rgba(44,115,210,0.12), transparent 50%)',
        }}
      />

      {/* Particle field */}
      <motion.div
        variants={heroParticles}
        initial="hidden"
        animate="visible"
        style={reduceMotion ? undefined : { y: particleY }}
        className="absolute inset-0"
      >
        <ParticleField count={50} className="absolute inset-0" />
      </motion.div>

      {/* Mandala centerpiece */}
      <motion.div
        variants={heroMandala}
        initial="hidden"
        animate="visible"
        style={reduceMotion ? undefined : { y: mandalaY, scale: mandalaScale }}
        className="pointer-events-none absolute aspect-square w-[min(110vw,900px)] opacity-50"
      >
        <Mandala duration={140} />
      </motion.div>

      {/* Headline stack */}
      <motion.div
        variants={heroContainer}
        initial="hidden"
        animate="visible"
        style={reduceMotion ? undefined : { y: textY, opacity: textOpacity }}
        className="relative z-10 flex flex-col items-center px-6 text-center"
      >
        <motion.p
          variants={heroSanskrit}
          className="font-sanskrit mb-6 text-[clamp(1rem,2.5vw,1.5rem)] tracking-[0.15em] text-gradient-gold"
        >
          {SITE.themeDevanagari}
        </motion.p>

        <motion.h1
          id="hero-heading"
          variants={heroHeadline}
          className="font-display text-[clamp(3rem,8vw,7rem)] font-light italic leading-[0.95] text-[var(--text-primary)]"
        >
          The End Is
          <br />
          <span className="text-gradient-sunrise font-normal">The Beginning</span>
        </motion.h1>

        <motion.p
          variants={heroSub}
          className="font-accent mt-8 text-[0.7rem] uppercase tracking-[0.3em] text-[var(--text-secondary)] sm:text-xs"
        >
          Rotaract Club of Mumbai Salt City · {SITE.year}
        </motion.p>

        <motion.div variants={heroSub} className="mt-10">
          <GlassButton variant="gold" onClick={scrollToNext} breathe>
            Begin the Journey
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </GlassButton>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToNext}
        aria-label="Scroll to next section"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 1.8, duration: 0.8 } }}
      >
        <span className="font-accent text-[0.6rem] uppercase tracking-[0.3em] text-[var(--text-muted)]">
          Scroll to unfold
        </span>
        <div className="relative h-12 w-px bg-gradient-to-b from-[var(--accent-gold)]/60 to-transparent">
          <motion.span
            className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[var(--accent-gold)]"
            {...(reduceMotion ? {} : scrollIndicator)}
          />
        </div>
        <ArrowDown className="h-3 w-3 text-[var(--text-muted)]" />
      </motion.button>
    </section>
  );
}
