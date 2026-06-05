'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS, SITE } from '@/lib/constants';
import { heroNav } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { MagneticLink } from './MagneticLink';

export function GlassNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
          className="glass glass-glow flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold tracking-tight transition-colors hover:bg-white/10"
        >
          <span className="font-display text-gradient-gold text-lg">R</span>
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Main navigation"
          className="glass glass-glow hidden items-center gap-1 rounded-full px-2 py-2 lg:flex"
        >
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
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
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
