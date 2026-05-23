import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { Footer } from '@/components/sections/Footer';
import { AVENUES, SITE } from '@/lib/constants';
import { fadeUp } from '@/lib/motion';
import type { Project } from '@/types';

export const metadata: Metadata = {
  title: 'Projects',
  description: `Avenues of service and signature projects — ${SITE.name}.`,
};

// TODO: expand with real projects, images (/public/images/projects/), impact metrics
const PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Coastal Cleanup Drive',
    avenue: 'Community Service',
    description: 'Restoring Mumbai\'s shoreline, one tide at a time.',
    status: 'ongoing',
  },
  {
    id: 'p2',
    title: 'Leadership Bootcamp',
    avenue: 'Professional Development',
    description: 'Workshops cultivating the next generation of changemakers.',
    status: 'ongoing',
  },
  {
    id: 'p3',
    title: 'Twin Club Exchange',
    avenue: 'International Service',
    description: 'Bridging cultures through cross-border collaboration.',
    status: 'completed',
  },
];

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Work"
        sanskrit="सेवा"
        title={
          <>
            Where ideas become <span className="italic text-gradient-sunrise">impact.</span>
          </>
        }
        subtitle="Service flows through eleven avenues. Here is how we channel it — past, present, and ongoing."
      />

      <div className="mx-auto max-w-7xl px-6 pb-24">
        {/* Avenues overview */}
        <ScrollReveal>
          <h2 className="font-display mb-6 text-3xl font-light text-[var(--text-primary)]">
            The Eleven Avenues
          </h2>
        </ScrollReveal>
        <div className="mb-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AVENUES.map((avenue, i) => (
            <ScrollReveal key={avenue.id} variants={fadeUp} delay={(i % 4) * 0.06}>
              <GlassCard className="h-full p-6" glowColor={avenue.color}>
                <span
                  className="mb-3 block h-1 w-10 rounded-full"
                  style={{ background: avenue.color }}
                />
                <h3 className="font-display text-xl text-[var(--text-primary)]">{avenue.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{avenue.description}</p>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>

        {/* Signature projects */}
        <ScrollReveal>
          <h2 className="font-display mb-6 text-3xl font-light text-[var(--text-primary)]">
            Signature Projects
          </h2>
        </ScrollReveal>
        <div className="grid gap-5 md:grid-cols-3">
          {PROJECTS.map((project, i) => (
            <ScrollReveal key={project.id} variants={fadeUp} delay={(i % 3) * 0.08}>
              <GlassCard className="flex h-full flex-col p-7">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-accent text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)]">
                    {project.avenue}
                  </span>
                  <span
                    className="rounded-full border px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wide"
                    style={{
                      borderColor:
                        project.status === 'ongoing'
                          ? 'rgba(212,175,55,0.5)'
                          : 'rgba(245,245,247,0.2)',
                      color:
                        project.status === 'ongoing'
                          ? 'var(--accent-gold)'
                          : 'var(--text-muted)',
                    }}
                  >
                    {project.status}
                  </span>
                </div>
                <h3 className="font-display text-2xl text-[var(--text-primary)]">{project.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {project.description}
                </p>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
