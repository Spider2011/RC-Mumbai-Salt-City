'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { CHAT_TOPICS, GREETING, type ChatAnswer, type ChatLink } from '@/lib/chatbot';
import { cn } from '@/lib/utils';

type Message =
  | { role: 'user'; text: string }
  | { role: 'bot'; answer: ChatAnswer };

const isInternal = (href: string) => href.startsWith('/');

function AnswerLinks({ links, onNavigate }: { links: ChatLink[]; onNavigate: () => void }) {
  return (
    <div className="mt-3 flex flex-col gap-2">
      {links.map((link) =>
        isInternal(link.href) ? (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className="group inline-flex items-center justify-between gap-2 rounded-xl border border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/[0.08] px-3 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-gold)]/[0.16]"
          >
            {link.label}
            <ArrowRight className="h-4 w-4 text-[var(--accent-gold)] transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <a
            key={link.href}
            href={link.href}
            target={link.href.startsWith('http') ? '_blank' : undefined}
            rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-3 py-2 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--accent-gold)]/40 hover:text-[var(--accent-gold)]"
          >
            {link.label}
          </a>
        )
      )}
    </div>
  );
}

/**
 * Scripted "RCMSC assistant" — a floating widget with fixed inputs (preset
 * question chips) and fixed outputs (canned answers computed live from site
 * data). No backend, no LLM. Glass-styled, reduced-motion aware, keyboard
 * accessible.
 */
export function ChatBot() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'bot', answer: { lines: [GREETING] } }]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Keep the conversation scrolled to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  // Esc closes; focus the panel when it opens.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function ask(topicId: string) {
    const topic = CHAT_TOPICS.find((t) => t.id === topicId);
    if (!topic) return;
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: topic.question },
      { role: 'bot', answer: topic.answer() },
    ]);
  }

  return (
    <>
      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="Salty — RCMSC assistant"
            tabIndex={-1}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="glass-glow fixed bottom-24 right-4 z-40 flex max-h-[70vh] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-white/12 bg-[#12172a] md:right-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <Image src="/images/salty.png" alt="Salty emblem" width={40} height={40} className="h-10 w-10 rounded-full" />
                <div>
                  <p className="font-display text-lg leading-none text-[var(--text-primary)]">Salty</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Tap a question to begin</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-white/10 hover:text-[var(--text-primary)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {messages.map((m, i) =>
                m.role === 'user' ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-[var(--accent-gold)]/15 px-4 py-2.5 text-sm text-[var(--text-primary)]">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex justify-start">
                    <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                      {m.answer.lines.map((line, j) => (
                        <p key={j} className={cn(j > 0 && 'mt-2')}>
                          {line}
                        </p>
                      ))}
                      {m.answer.links && m.answer.links.length > 0 && (
                        <AnswerLinks links={m.answer.links} onNavigate={() => setOpen(false)} />
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Quick-reply chips */}
            <div className="flex flex-wrap gap-2 border-t border-white/10 px-5 py-4">
              {CHAT_TOPICS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => ask(t.id)}
                  className="rounded-full border border-white/12 px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-gold)]/40 hover:text-[var(--accent-gold)]"
                >
                  {t.question}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open Salty, the RCMSC assistant'}
        aria-expanded={open}
        whileHover={reduceMotion ? undefined : { scale: 1.06 }}
        whileTap={reduceMotion ? undefined : { scale: 0.94 }}
        className="glass-glow fixed bottom-6 right-4 z-40 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-[var(--accent-gold)]/40 bg-[#12172a] text-[var(--accent-gold)] md:right-6"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="salty"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Image src="/images/salty.png" alt="Salty" fill sizes="56px" className="object-cover" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
