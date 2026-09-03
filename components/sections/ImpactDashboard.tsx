'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, animate, useInView, useReducedMotion } from 'framer-motion';
import { Trophy, CheckCircle2, ClipboardList } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { fadeUp, staggerContainer } from '@/lib/motion';
import { EVENTS, getEventStatus } from '@/lib/events';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const GOAL = 100;

/** Animated integer that counts up once it scrolls into view. */
function CountUp({ value, duration = 1.4 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration, reduce]);

  return <span ref={ref}>{display}</span>;
}

export function ImpactDashboard({ embedded = false }: { embedded?: boolean }) {
  // "Projects done" — completed events from the events data.
  const projectsDone = useMemo(
    () => EVENTS.filter((e) => getEventStatus(e) === 'past').length,
    []
  );

  // "Projects reported" — count from the director portal (public count only).
  const [reported, setReported] = useState(0);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let active = true;
    (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase.rpc('reported_count');
        if (active && !error && typeof data === 'number') setReported(data);
      } catch {
        /* leave at 0 if unavailable */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const progress = Math.min(100, Math.round((projectsDone / GOAL) * 100));

  const tiles = [
    {
      icon: CheckCircle2,
      value: projectsDone,
      label: 'Projects Done',
      sub: 'Completed this year',
    },
    {
      icon: ClipboardList,
      value: reported,
      label: 'Projects Reported',
      sub: 'Logged by directors',
    },
    {
      icon: Trophy,
      value: GOAL,
      label: 'Projects Goal',
      sub: 'Our target for the year',
    },
  ];

  return (
    <section
      className={embedded ? '' : 'section mx-auto max-w-7xl px-6'}
      aria-labelledby="impact-heading"
    >
      <div className={embedded ? 'mb-6' : 'mb-10 text-center'}>
        <Eyebrow>Our Impact</Eyebrow>
        <h2
          id="impact-heading"
          className={`font-display mt-4 font-light leading-[1.15] text-[var(--text-primary)] ${
            embedded ? 'text-2xl' : 'text-[clamp(1.8rem,3.5vw,2.8rem)]'
          }`}
        >
          The road to <span className="text-gradient-gold">100 projects.</span>
        </h2>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10%' }}
        className="grid gap-5 sm:grid-cols-3"
      >
        {tiles.map(({ icon: Icon, value, label, sub }) => (
          <motion.div key={label} variants={fadeUp}>
            <GlassCard className="flex flex-col items-center p-8 text-center" glowColor="#D4AF37">
              <Icon className="mb-4 h-7 w-7 text-[var(--accent-gold)]" strokeWidth={1.5} />
              <span className="font-accent text-gradient-gold text-5xl font-semibold tabular-nums">
                <CountUp value={value} />
              </span>
              <span className="mt-3 text-lg font-medium text-[var(--text-primary)]">{label}</span>
              <span className="mt-1 text-sm text-[var(--text-secondary)]">{sub}</span>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Progress toward the goal */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10%' }}
        className="mt-8"
      >
        <GlassCard className="p-6 md:p-8" tilt={false}>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              Progress to goal
            </span>
            <span className="text-sm text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--accent-gold)]">{projectsDone}</span> of {GOAL}{' '}
              projects · {progress}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent-gold)]/70 to-[var(--accent-gold)]"
              initial={{ width: '0%' }}
              whileInView={{ width: `${progress}%` }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </GlassCard>
      </motion.div>
    </section>
  );
}
