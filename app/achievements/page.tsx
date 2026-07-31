import type { Metadata } from 'next';
import { Trophy, Crown, Star, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { Footer } from '@/components/sections/Footer';
import { ACHIEVEMENT_YEARS } from '@/lib/achievements';
import { SITE } from '@/lib/constants';
import { fadeUp } from '@/lib/motion';
import type { AchievementGroup, AchievementIcon } from '@/types';

export const metadata: Metadata = {
  title: 'Achievements',
  description: `Awards, recognitions and nominations of ${SITE.name}.`,
};

const ICON: Record<AchievementIcon, typeof Trophy> = {
  trophy: Trophy,
  crown: Crown,
  star: Star,
  users: Users,
};

function Group({ group }: { group: AchievementGroup }) {
  const Icon = ICON[group.icon];
  const won = group.kind === 'won';

  return (
    <section className="mt-14">
      <ScrollReveal>
        <div className="mb-6 flex items-baseline gap-3">
          <h3 className="font-display flex items-center gap-3 text-2xl font-light text-[var(--text-primary)] md:text-3xl">
            <Icon className="h-6 w-6 text-[var(--accent-gold)]" />
            {group.title}
          </h3>
          {group.subtitle && (
            <span className="text-sm text-[var(--text-muted)]">{group.subtitle}</span>
          )}
        </div>
      </ScrollReveal>

      {/* Project-name-only nominations render as a compact chip grid. */}
      {group.kind === 'nomination' && !group.labelIsCategory ? (
        <ScrollReveal>
          <div className="flex flex-wrap gap-3">
            {group.items.map((item) => (
              <span
                key={item.label}
                className="glass rounded-full border border-white/12 px-4 py-2 text-sm text-[var(--text-secondary)]"
              >
                {item.label}
              </span>
            ))}
          </div>
        </ScrollReveal>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {group.items.map((item, i) => (
            <ScrollReveal key={item.label} variants={fadeUp} delay={(i % 2) * 0.06}>
              <GlassCard
                className="flex h-full items-start justify-between gap-4 p-6"
                tilt={false}
                glowColor={won ? '#D4AF37' : undefined}
              >
                <div>
                  {group.labelIsCategory ? (
                    <>
                      <p className="font-accent text-xs uppercase tracking-[0.18em] text-[var(--accent-gold)]">
                        {item.label}
                      </p>
                      <p className="font-display mt-1.5 text-xl text-[var(--text-primary)]">
                        {item.winner}
                      </p>
                    </>
                  ) : (
                    <p className="font-display text-xl text-[var(--text-primary)]">{item.label}</p>
                  )}
                </div>
                {item.badge && (
                  <span className="shrink-0 rounded-full border border-[var(--accent-gold)]/40 px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wide text-[var(--accent-gold)]">
                    {item.badge}
                  </span>
                )}
                {won && !item.badge && (
                  <Trophy className="h-4 w-4 shrink-0 text-[var(--accent-gold)]/70" />
                )}
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      )}
    </section>
  );
}

export default function AchievementsPage() {
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
        subtitle="Awards won and honours earned across the years — proof of the tide, and a promise of the next."
      />

      <div className="mx-auto max-w-5xl px-6 pb-24">
        {ACHIEVEMENT_YEARS.map((yr, idx) => {
          const wonCount = yr.groups
            .filter((g) => g.kind === 'won')
            .reduce((n, g) => n + g.items.length, 0);
          const nomCount = yr.groups
            .filter((g) => g.kind === 'nomination')
            .reduce((n, g) => n + g.items.length, 0);

          return (
            <div key={yr.year} className={idx > 0 ? 'mt-24' : ''}>
              {/* Year banner */}
              <ScrollReveal>
                <GlassCard className="p-8 md:p-10" tilt={false} variant="heavy">
                  <p className="eyebrow">Session</p>
                  <h2 className="font-display mt-2 text-4xl font-light text-gradient-gold">
                    {yr.year}
                  </h2>
                  <p className="mt-3 text-[var(--text-secondary)]">
                    Under the leadership of{' '}
                    <span className="text-[var(--text-primary)]">{yr.leader}</span>
                    {yr.leaderRole ? `, ${yr.leaderRole}` : ''}.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-8">
                    <div>
                      <p className="font-display text-3xl font-light text-[var(--text-primary)]">
                        {wonCount}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">Awards won</p>
                    </div>
                    <div>
                      <p className="font-display text-3xl font-light text-[var(--text-primary)]">
                        {nomCount}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">Nominations</p>
                    </div>
                  </div>
                </GlassCard>
              </ScrollReveal>

              {yr.groups.map((group) => (
                <Group key={group.id} group={group} />
              ))}
            </div>
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
