import type { Metadata } from 'next';
import Image from 'next/image';
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

// Member with optional avatar framing controls.
//  - imagePosition: CSS object-position focal point (e.g. '50% 20%' biases toward the head)
//  - imageScale: zoom factor for full-body shots so the face fills the circle
type BoardMember = TeamMember & { imagePosition?: string; imageScale?: number };

// Photos live in /public/images/team/ (lowercase names for case-safe Linux/Vercel paths).
const BOARD: BoardMember[] = [
  { name: 'Tanish Momaya', role: 'President', image: '/images/team/tanish.png', bio: 'Leading the year of Aant Asti Prarambh.', imagePosition: '51% 15%', imageScale: 2.4 },
  { name: 'Kashvi Kothari', role: 'Secretary', image: '/images/team/kashvi.jpg', imagePosition: '38% 13%', imageScale: 2.8 },
  { name: 'Romil Lodaya', role: 'Vice President', image: '/images/team/romil.jpg' },
  { name: 'Hriday Kataria', role: 'Vice President', image: '/images/team/hriday.jpg' },
  { name: 'Krisha Panchal', role: 'Joint Secretary', image: '/images/team/krisha.jpg' },
  { name: 'Shreedhee Ved', role: 'Joint Secretary', image: '/images/team/shreedhee.jpg' },
  { name: 'Aayush Shah', role: 'Sergeant At Arms', image: '/images/team/aayush.jpg' },
  { name: 'Hiya Doshi', role: 'HRD' }, // TODO: add photo when available
  { name: 'Yash Thakkar', role: 'Treasurer', image: '/images/team/yash.jpg' },
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
                {/* Avatar: photo if available, else initials fallback */}
                <div
                  className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/15"
                  style={{
                    background: 'linear-gradient(135deg, rgba(132,94,194,0.25), rgba(44,115,210,0.25))',
                  }}
                >
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={`${member.name}, ${member.role}`}
                      fill
                      sizes="96px"
                      className="object-cover"
                      style={{
                        objectPosition: member.imagePosition ?? '50% 50%',
                        transform: member.imageScale ? `scale(${member.imageScale})` : undefined,
                        transformOrigin: member.imagePosition ?? '50% 50%',
                      }}
                    />
                  ) : (
                    <span className="font-display text-2xl text-[var(--text-primary)]">
                      {initials(member.name)}
                    </span>
                  )}
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
