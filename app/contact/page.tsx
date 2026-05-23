import type { Metadata } from 'next';
import { Mail } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { Footer } from '@/components/sections/Footer';
import { ContactForm } from '@/components/sections/ContactForm';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { InstagramIcon, LinkedinIcon, FacebookIcon, XIcon } from '@/components/ui/SocialIcons';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Reach out to ${SITE.name}.`,
};

type IconComponent = ({ className }: { className?: string }) => React.JSX.Element;

const SOCIALS: { label: string; href: string; icon: IconComponent }[] = [
  { label: 'Instagram', href: SITE.instagram, icon: InstagramIcon },
  { label: 'LinkedIn', href: SITE.linkedin, icon: LinkedinIcon },
  { label: 'Facebook', href: SITE.facebook, icon: FacebookIcon },
  { label: 'X', href: SITE.twitter, icon: XIcon },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Reach Out"
        sanskrit="संवाद"
        title={
          <>
            Begin a <span className="italic text-gradient-twilight">conversation.</span>
          </>
        }
        subtitle="Whether you wish to collaborate, partner, or simply say hello — the door is open."
      />

      <div className="mx-auto grid max-w-6xl gap-8 px-6 pb-24 lg:grid-cols-[1.3fr_1fr]">
        <ScrollReveal>
          <ContactForm />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="flex flex-col gap-5">
            <GlassCard className="p-8" tilt={false}>
              <h2 className="font-display text-2xl font-light text-[var(--text-primary)]">
                Direct line
              </h2>
              <a
                href={`mailto:${SITE.email}`}
                className="mt-4 inline-flex items-center gap-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-gold)]"
              >
                <Mail className="h-4 w-4" />
                {SITE.email}
              </a>
              <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                {SITE.name}
                <br />
                {SITE.district}
              </p>
            </GlassCard>

            <GlassCard className="p-8" tilt={false}>
              <h2 className="font-display text-2xl font-light text-[var(--text-primary)]">
                Follow the journey
              </h2>
              <div className="mt-5 flex gap-3">
                {SOCIALS.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="glass flex h-12 w-12 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-white/10 hover:text-[var(--accent-gold)]"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        </ScrollReveal>
      </div>

      <Footer />
    </>
  );
}
