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

// Avatars use a CSS background-image (samples the full 640px source — no upscaling blur).
//  - focal: background-position, set to each person's face (from viewing the photos)
//  - zoom: background-size; higher % crops tighter so the face fills the circle
type BoardMember = TeamMember & { focal?: string; zoom?: string };

// Photos live in /public/images/team/ (lowercase, case-safe for Linux/Vercel).
const BOARD: BoardMember[] = [
  { name: 'Tanish Momaya', role: 'President', image: '/images/team/tanish.jpg', bio: 'Leading the year of Aant Asti Prarambh.', focal: '51% 15%', zoom: '300%' },
  { name: 'Kashvi Kothari', role: 'Secretary', image: '/images/team/kashvi.jpg', focal: '40% 13%', zoom: '320%' },
  { name: 'Romil Lodaya', role: 'Vice President', image: '/images/team/romil.jpg', focal: '48% 27%', zoom: '210%' },
  { name: 'Hriday Kataria', role: 'Vice President', image: '/images/team/hriday.jpg', focal: '47% 27%', zoom: '210%' },
  { name: 'Krisha Panchal', role: 'Joint Secretary', image: '/images/team/krisha.jpg', focal: '50% 30%', zoom: '185%' },
  { name: 'Shreedhee Ved', role: 'Joint Secretary', image: '/images/team/shreedhee.jpg', focal: '43% 28%', zoom: '215%' },
  { name: 'Aayush Shah', role: 'Sergeant At Arms', image: '/images/team/aayush.jpg', focal: '52% 42%', zoom: '165%' },
  { name: 'Hiya Doshi', role: 'HRD', image: '/images/team/hiya.jpg', focal: '58% 30%', zoom: '230%' },
  { name: 'Yash Thakkar', role: 'Treasurer', image: '/images/team/yash.jpg', focal: '44% 30%', zoom: '200%' },
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
                {/* Avatar: photo via background-image (sharp zoom), else initials fallback */}
                <div
                  role="img"
                  aria-label={member.image ? `${member.name}, ${member.role}` : undefined}
                  className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/15"
                  style={
                    member.image
                      ? {
                          backgroundImage: `url(${member.image})`,
                          backgroundSize: member.zoom ?? 'cover',
                          backgroundPosition: member.focal ?? 'center',
                          backgroundRepeat: 'no-repeat',
                        }
                      : {
                          background:
                            'linear-gradient(135deg, rgba(132,94,194,0.25), rgba(44,115,210,0.25))',
                        }
                  }
                >
                  {!member.image && (
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
