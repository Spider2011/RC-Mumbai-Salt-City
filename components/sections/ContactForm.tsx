'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { TextField, TextAreaField } from '@/components/ui/FormField';

interface FormState {
  name: string;
  email: string;
  message: string;
}

type Errors = Partial<Record<keyof FormState, string>>;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Errors = {};
    if (!form.name.trim()) next.name = 'Please tell us your name.';
    if (!EMAIL_RE.test(form.email)) next.email = 'Enter a valid email address.';
    if (form.message.trim().length < 10) next.message = 'A little more detail, please.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // TODO: wire to a real endpoint / API route. Simulated for now.
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setDone(true);
  }

  return (
    <GlassCard className="p-8 md:p-12" tilt={false} variant="heavy">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-10 text-center"
          >
            <CheckCircle2 className="h-14 w-14 text-[var(--accent-gold)]" strokeWidth={1.5} />
            <h2 className="font-display mt-5 text-3xl font-light text-[var(--text-primary)]">
              Message received.
            </h2>
            <p className="mt-3 max-w-md text-[var(--text-secondary)]">
              Thank you for reaching out. We&apos;ll respond as soon as the tide allows.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            noValidate
            className="grid gap-5"
          >
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={(v) => update('name', v)}
              placeholder="Your name"
              required
              error={errors.name}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(v) => update('email', v)}
              placeholder="you@example.com"
              required
              error={errors.email}
            />
            <TextAreaField
              label="Message"
              name="message"
              value={form.message}
              onChange={(v) => update('message', v)}
              placeholder="How can we help?"
              required
              error={errors.message}
            />
            <div className="mt-2">
              <GlassButton type="submit" variant="gold" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send Message'}
                {!submitting && <Send className="h-4 w-4" />}
              </GlassButton>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
