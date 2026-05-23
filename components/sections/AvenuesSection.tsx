'use client';

import { motion } from 'framer-motion';
import {
  Heart,
  Briefcase,
  Users,
  Globe,
  Star,
  Handshake,
  Megaphone,
  MessageSquare,
  Rocket,
  PenTool,
  Trophy,
  Share2,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AVENUES } from '@/lib/constants';
import { fadeUp, staggerFast } from '@/lib/motion';

const ICONS: Record<string, LucideIcon> = {
  heart: Heart,
  briefcase: Briefcase,
  users: Users,
  globe: Globe,
  star: Star,
  handshake: Handshake,
  megaphone: Megaphone,
  messageSquare: MessageSquare,
  rocket: Rocket,
  penTool: PenTool,
  trophy: Trophy,
  share2: Share2,
};

export function AvenuesSection() {
  return (
    <section className="section mx-auto max-w-7xl px-6" aria-labelledby="avenues-heading">
      <SectionHeading
        eyebrow="What We Do"
        title={
          <span id="avenues-heading">
            Eleven avenues, <span className="italic text-gradient-twilight">one purpose.</span>
          </span>
        }
        subtitle="Service flows through every facet of who we are. Each avenue is a different doorway into the same vision."
        align="center"
        className="mx-auto mb-14 max-w-2xl"
      />

      <motion.div
        variants={staggerFast}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-8%' }}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {AVENUES.map((avenue) => {
          const Icon = ICONS[avenue.icon] ?? Star;
          return (
            <motion.div key={avenue.id} variants={fadeUp}>
              <GlassCard className="group flex h-full flex-col p-7" glowColor={avenue.color}>
                <span
                  className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${avenue.color}1A`, color: avenue.color }}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <h3 className="font-display text-2xl font-medium text-[var(--text-primary)]">
                  {avenue.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {avenue.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors group-hover:text-[var(--accent-gold)]">
                  Learn More
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
