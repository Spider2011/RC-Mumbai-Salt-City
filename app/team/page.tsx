import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { Footer } from '@/components/sections/Footer';
import { SITE } from '@/lib/constants';
import { fadeUp } from '@/lib/motion';
import type { TeamMember } from '@/types';

export const metadata: Metadata = {
  title: 'Team',
  description: `Board of Directors ${SITE.year} — ${SITE.name}.`,
};

// TODO: add board photos to /public/images/team/ and wire into the avatar slot
const BOARD: TeamMember[] = [
  { name: 'Tanish Momaya', role: 'President', bio: 'Leading the year of Aant Asti Prarambh.' },
  { name: 'Kashvi Kothari', role: 'Secretary' },
  { name: 'Romil Lodaya', role: 'Vice President' },
  { name: 'Hriday Kataria', role: 'Vice President' },
  { name: 'Krisha Panchal', role: 'Joint Secretary' },
  { name: 'Shreedhee Ved', role: 'Joint Secretary' },
  { name: 'Aayush Shah', role: 'Sergeant At Arms' },
  { name: 'Hiya Doshi', role: 'HRD' },
  { name: 'Yash Thakkar', role: 'Treasurer' },
];

function initials(name: string): string {
  if (name === 'TBA') return '—';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
}

export default function TeamPage() {
  return (
    <>
      <PageHeader
        eyebrow={`Board of Directors · ${SITE.year}`}
        sanskrit="नेतृत्व"
        title={
          <>
            The hands behind <span className="italic text-gradient-twilight">the vision.</span>
          </>
        }
        subtitle="Leadership is not a position — it is a season of service. Meet those carrying the torch this year."
      />

      <div className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BOARD.map((member, i) => (
            <ScrollReveal key={`${member.role}-${i}`} variants={fadeUp} delay={(i % 3) * 0.08}>
              <GlassCard
                className="flex h-full flex-col items-center p-8 text-center"
                glowColor={member.role === 'President' ? '#D4AF37' : '#845EC2'}
              >
                {/* Avatar placeholder — replace with Next/Image from /public/images/team/ */}
                <div
                  className="flex h-24 w-24 items-center justify-center rounded-full border border-white/15"
                  style={{
                    background: 'linear-gradient(135deg, rgba(132,94,194,0.25), rgba(44,115,210,0.25))',
                  }}
                >
                  <span className="font-display text-2xl text-[var(--text-primary)]">
                    {initials(member.name)}
                  </span>
                </div>
                <h3 className="font-display mt-5 text-2xl font-medium text-[var(--text-primary)]">
                  {member.name}
                </h3>
                <p className="font-accent mt-1 text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)]">
                  {member.role}
                </p>
                {member.bio && (
                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {member.bio}
                  </p>
                )}
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
