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

function initials(name: string): string {
  const cleaned = name.replace(/Rtr\.?/gi, '').split('&')[0].trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

function GroupHeading({ group }: { group: AchievementGroup }) {
  const Icon = ICON[group.icon];
  return (
    <ScrollReveal>
      <div className="mb-7 flex items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/[0.06]">
          <Icon className="h-5 w-5 text-[var(--accent-gold)]" />
        </span>
        <div>
          <h3 className="font-display text-2xl font-light leading-none text-[var(--text-primary)] md:text-3xl">
            {group.title}
          </h3>
          {group.subtitle && (
            <p className="mt-1 text-sm text-[var(--text-muted)]">{group.subtitle}</p>
          )}
        </div>
      </div>
    </ScrollReveal>
  );
}

function AwardsWon({ group }: { group: AchievementGroup }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {group.items.map((item, i) => (
        <ScrollReveal key={item.label} variants={fadeUp} delay={(i % 2) * 0.07}>
          <GlassCard className="group relative h-full overflow-hidden p-7" glowColor="#D4AF37">
            {/* gold top accent */}
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent-gold)] to-transparent opacity-70"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-6 text-[7rem] leading-none text-[var(--accent-gold)]/[0.06]"
            >
              <Trophy className="h-24 w-24" />
            </span>
            <p className="font-accent text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)]">
              {item.label}
            </p>
            <p className="font-display mt-3 text-2xl leading-snug text-[var(--text-primary)]">
              {item.winner}
            </p>
          </GlassCard>
        </ScrollReveal>
      ))}
    </div>
  );
}

function Medallions({ group }: { group: AchievementGroup }) {
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {group.items.map((item, i) => (
        <ScrollReveal key={item.label} variants={fadeUp} delay={(i % 4) * 0.06}>
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-[var(--accent-gold)]/50 bg-[var(--accent-gold)]/[0.06] shadow-[0_0_28px_-8px_rgba(212,175,55,0.6)]">
              <Crown className="absolute -top-3 h-6 w-6 text-[var(--accent-gold)]" />
              <span className="font-display text-2xl text-gradient-gold">{item.badge}</span>
            </div>
            <p className="font-display mt-4 text-lg leading-snug text-[var(--text-primary)]">
              {item.label}
            </p>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}

function NominationCards({ group }: { group: AchievementGroup }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {group.items.map((item, i) => (
        <ScrollReveal key={item.label} variants={fadeUp} delay={(i % 3) * 0.06}>
          <div className="glass group flex h-full items-center gap-3 rounded-2xl border border-white/10 p-5 transition-colors hover:border-[var(--accent-gold)]/40">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/[0.06]">
              <Star className="h-4 w-4 text-[var(--accent-gold)]" />
            </span>
            <p className="font-display text-lg leading-snug text-[var(--text-primary)]">
              {item.label}
            </p>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}

function Roster({ group }: { group: AchievementGroup }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {group.items.map((item, i) => (
        <ScrollReveal key={item.label} variants={fadeUp} delay={(i % 2) * 0.05}>
          <div className="glass flex h-full items-center gap-4 rounded-2xl border border-white/10 p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--accent-gold)]/40 bg-[var(--accent-gold)]/[0.08] font-display text-sm text-gradient-gold">
              {initials(item.winner ?? item.label)}
            </span>
            <div className="min-w-0">
              <p className="font-accent text-[0.7rem] uppercase tracking-[0.16em] text-[var(--accent-gold)]">
                {item.label}
              </p>
              <p className="font-display mt-0.5 text-lg leading-snug text-[var(--text-primary)]">
                {item.winner}
              </p>
            </div>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}

function Group({ group }: { group: AchievementGroup }) {
  const layout =
    group.kind === 'won' && group.labelIsCategory
      ? 'awards'
      : group.kind === 'won'
        ? 'medallions'
        : group.labelIsCategory
          ? 'roster'
          : 'chips';

  return (
    <section className="mt-16">
      <GroupHeading group={group} />
      {layout === 'awards' && <AwardsWon group={group} />}
      {layout === 'medallions' && <Medallions group={group} />}
      {layout === 'chips' && <NominationCards group={group} />}
      {layout === 'roster' && <Roster group={group} />}
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
            <div key={yr.year} className={idx > 0 ? 'mt-28' : ''}>
              {/* Year hero */}
              <ScrollReveal>
                <div className="relative overflow-hidden rounded-3xl border border-white/10 glass-heavy glass-glow p-8 md:p-12">
                  <Trophy
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 text-[var(--accent-gold)]/[0.05]"
                  />
                  <p className="eyebrow">Session</p>
                  <h2 className="font-display mt-2 text-[clamp(3rem,10vw,7rem)] font-light leading-[0.95] text-gradient-gold">
                    {yr.year}
                  </h2>
                  <p className="mt-3 max-w-xl text-[var(--text-secondary)]">
                    Under the leadership of{' '}
                    <span className="text-[var(--text-primary)]">{yr.leader}</span>
                    {yr.leaderRole ? `, ${yr.leaderRole}` : ''}.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <div className="glass rounded-2xl border border-[var(--accent-gold)]/25 px-6 py-4">
                      <p className="font-display text-4xl font-light text-gradient-gold">
                        {wonCount}
                      </p>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">Awards won</p>
                    </div>
                    <div className="glass rounded-2xl border border-white/10 px-6 py-4">
                      <p className="font-display text-4xl font-light text-[var(--text-primary)]">
                        {nomCount}
                      </p>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">Nominations</p>
                    </div>
                  </div>
                </div>
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
