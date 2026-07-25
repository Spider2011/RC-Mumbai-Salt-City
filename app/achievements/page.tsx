import type { Metadata } from 'next';
import { Trophy, Medal, Flag, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { Footer } from '@/components/sections/Footer';
import { ACHIEVEMENTS, ACHIEVEMENT_STATS } from '@/lib/achievements';
import { SITE } from '@/lib/constants';
import { fadeUp } from '@/lib/motion';
import type { AchievementCategory } from '@/types';

export const metadata: Metadata = {
  title: 'Achievements',
  description: `Awards, recognitions and milestones of ${SITE.name}.`,
};

const CATEGORY_ICON: Record<AchievementCategory, typeof Trophy> = {
  Award: Trophy,
  Recognition: Medal,
  Milestone: Flag,
  Impact: Sparkles,
};

// Display order of the grouped sections.
const CATEGORY_ORDER: AchievementCategory[] = ['Award', 'Recognition', 'Milestone', 'Impact'];

export default function AchievementsPage() {
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: ACHIEVEMENTS.filter((a) => a.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <PageHeader
        eyebrow="Milestones"
        sanskrit="गौरव"
        title={
          <>
            Marks of the <span className="italic text-gradient-gold">journey.</span>
          </>
        }
        subtitle="Every award and milestone is a wave that has already broken on the shore — proof of the tide, and a promise of the next."
      />

      <div className="mx-auto max-w-5xl px-6 pb-24">
        {/* Impact stats */}
        <ScrollReveal>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {ACHIEVEMENT_STATS.map((stat) => (
              <GlassCard key={stat.label} className="p-6 text-center" tilt={false} glowColor="#D4AF37">
                <p className="font-display text-4xl font-light text-gradient-gold">{stat.value}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{stat.label}</p>
              </GlassCard>
            ))}
          </div>
        </ScrollReveal>

        {grouped.map((group) => {
          const Icon = CATEGORY_ICON[group.category];
          return (
            <section key={group.category} className="mt-16">
              <ScrollReveal>
                <h2 className="font-display mb-6 flex items-center gap-3 text-3xl font-light text-[var(--text-primary)]">
                  <Icon className="h-6 w-6 text-[var(--accent-gold)]" />
                  {group.category === 'Impact' ? 'Impact' : `${group.category}s`}
                </h2>
              </ScrollReveal>
              <div className="grid gap-5 md:grid-cols-2">
                {group.items.map((item, i) => (
                  <ScrollReveal key={item.id} variants={fadeUp} delay={(i % 2) * 0.08}>
                    <GlassCard className="flex h-full flex-col p-7">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        {item.org && (
                          <span className="font-accent text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)]">
                            {item.org}
                          </span>
                        )}
                        <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wide text-[var(--text-muted)]">
                          {item.date}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl text-[var(--text-primary)]">
                        {item.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                        {item.description}
                      </p>
                    </GlassCard>
                  </ScrollReveal>
                ))}
              </div>
            </section>
          );
        })}

        <GoldDivider className="my-16" animate />
        <ScrollReveal>
          <p className="text-center text-sm text-[var(--text-muted)]">
            More to come — this is only the beginning.
          </p>
        </ScrollReveal>
      </div>

      <Footer />
    </>
  );
}
