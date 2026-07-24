'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { NAV_LINKS, SITE } from '@/lib/constants';
import { heroNav } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { MagneticLink } from './MagneticLink';

const ABOUT_DROPDOWN = [
  { label: SITE.name, href: '/about' },
  { label: 'District 3141', href: '/about?tab=district' },
] as const;

const dropdownPanel = {
  hidden: { opacity: 0, y: -8, transition: { duration: 0.15 } },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const dropdownItem = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18 } },
};

export function GlassNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <>
      <motion.header
        variants={heroNav}
        initial="hidden"
        animate="visible"
        className="fixed inset-x-4 top-4 z-30 flex items-center justify-between md:inset-x-6"
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label={`${SITE.shortName} home`}
          className="flex h-16 w-16 items-center justify-center rounded-full transition-transform hover:scale-105"
        >
          <Image
            src="/images/logo.png"
            alt={`${SITE.shortName} logo`}
            width={64}
            height={64}
            priority
            className="h-16 w-16 rounded-full"
          />
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Main navigation"
          className="glass glass-glow hidden items-center gap-1 rounded-full px-2 py-2 lg:flex"
        >
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;

            if (link.href === '/about') {
              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setAboutOpen(true)}
                  onMouseLeave={() => setAboutOpen(false)}
                  onFocusCapture={() => setAboutOpen(true)}
                  onBlurCapture={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setAboutOpen(false);
                  }}
                >
                  <Link
                    href="/about"
                    className={cn(
                      'relative inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm transition-colors duration-300',
                      active
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-full bg-white/10"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                    <ChevronDown
                      className={cn(
                        'relative z-10 h-3.5 w-3.5 transition-transform duration-300',
                        aboutOpen && 'rotate-180'
                      )}
                    />
                  </Link>

                  {/* Dropdown — pt bridge keeps hover alive across the gap */}
                  <div className="absolute left-1/2 top-full -translate-x-1/2 pt-3">
                    <AnimatePresence>
                      {aboutOpen && (
                        <motion.div
                          variants={dropdownPanel}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="glass glass-glow min-w-[240px] rounded-2xl bg-[var(--bg-primary)]/85 p-2 backdrop-blur-2xl"
                        >
                          {ABOUT_DROPDOWN.map((item) => (
                            <motion.div key={item.href} variants={dropdownItem}>
                              <Link
                                href={item.href}
                                onClick={() => setAboutOpen(false)}
                                className="block rounded-xl px-4 py-3 text-sm text-[var(--text-secondary)] transition-colors hover:bg-white/10 hover:text-[var(--accent-gold)]"
                              >
                                {item.label}
                              </Link>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            }

            return (
              <MagneticLink
                key={link.href}
                href={link.href}
                pull={0.35}
                className={cn(
                  'relative inline-block rounded-full px-4 py-2 text-sm transition-colors duration-300',
                  active
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-white/10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </MagneticLink>
            );
          })}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="glass glass-glow flex h-12 w-12 items-center justify-center rounded-full lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-20 flex flex-col items-center justify-center lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-[var(--bg-primary)]/85 backdrop-blur-2xl"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              aria-label="Mobile navigation"
              className="relative flex flex-col items-center gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
              }}
            >
              {NAV_LINKS.map((link) => (
                <motion.div
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="flex flex-col items-center"
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'font-display text-3xl font-light transition-colors',
                      pathname === link.href
                        ? 'text-gradient-gold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    {link.label}
                  </Link>
                  {link.href === '/about' && (
                    <div className="mt-2 flex flex-col items-center gap-1.5">
                      {ABOUT_DROPDOWN.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--accent-gold)]"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
