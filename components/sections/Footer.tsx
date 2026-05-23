'use client';

import Link from 'next/link';
import { SITE, NAV_LINKS } from '@/lib/constants';
import { AudioToggle } from '@/components/effects/AudioToggle';
import { InstagramIcon, LinkedinIcon, FacebookIcon, XIcon } from '@/components/ui/SocialIcons';

type IconComponent = ({ className }: { className?: string }) => React.JSX.Element;

const SOCIALS: { label: string; href: string; icon: IconComponent }[] = [
  { label: 'Instagram', href: SITE.instagram, icon: InstagramIcon },
  { label: 'LinkedIn', href: SITE.linkedin, icon: LinkedinIcon },
  { label: 'Facebook', href: SITE.facebook, icon: FacebookIcon },
  { label: 'X', href: SITE.twitter, icon: XIcon },
];

export function Footer() {
  return (
    <footer className="relative mt-10" aria-label="Site footer">
      <div className="glass-heavy relative overflow-hidden border-t border-white/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
          {/* Left: brand */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="glass flex h-11 w-11 items-center justify-center rounded-full">
                <span className="font-display text-gradient-gold text-lg">R</span>
              </span>
              <span className="font-display text-lg text-[var(--text-primary)]">
                {SITE.shortName}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--text-secondary)]">
              {SITE.name} · {SITE.district}
            </p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{SITE.tagline}</p>
          </div>

          {/* Center: quick links */}
          <nav aria-label="Footer navigation" className="md:justify-self-center">
            <h3 className="eyebrow mb-4">Navigate</h3>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-gold)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right: socials */}
          <div className="md:justify-self-end">
            <h3 className="eyebrow mb-4">Connect</h3>
            <div className="flex gap-3">
              {SOCIALS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="glass flex h-11 w-11 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-white/10 hover:text-[var(--accent-gold)]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
            <div className="mt-5">
              <AudioToggle />
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="relative border-t border-white/10">
          <span
            aria-hidden
            className="font-sanskrit pointer-events-none absolute inset-0 flex items-center justify-center text-[clamp(3rem,12vw,9rem)] leading-none text-[var(--text-primary)]/[0.025]"
          >
            {SITE.themeDevanagari}
          </span>
          <p className="relative py-6 text-center text-xs text-[var(--text-muted)]">
            © {SITE.year} · Crafted with intention
          </p>
        </div>
      </div>
    </footer>
  );
}
