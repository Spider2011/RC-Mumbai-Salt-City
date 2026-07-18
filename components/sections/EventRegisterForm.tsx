'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { TextField, TextAreaField } from '@/components/ui/FormField';

interface EventRegisterFormProps {
  eventTitle: string;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  guests: string;
  note: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s-]{7,}$/;

export function EventRegisterForm({ eventTitle }: EventRegisterFormProps) {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    guests: '1',
    note: '',
  });
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
    if (!PHONE_RE.test(form.phone)) next.phone = 'Enter a valid phone number.';
    const guests = Number(form.guests);
    if (!Number.isInteger(guests) || guests < 1 || guests > 20)
      next.guests = 'Enter a number between 1 and 20.';
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
              You&apos;re registered!
            </h2>
            <p className="mt-3 max-w-md text-[var(--text-secondary)]">
              Thank you, {form.name.split(' ')[0]}. Your spot for {eventTitle} is reserved — we&apos;ll
              email the final details soon.
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
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Full name"
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
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={(v) => update('phone', v)}
                placeholder="+91 ..."
                required
                error={errors.phone}
              />
              <TextField
                label="Number of attendees"
                name="guests"
                type="number"
                value={form.guests}
                onChange={(v) => update('guests', v)}
                placeholder="1"
                required
                error={errors.guests}
              />
            </div>
            <TextAreaField
              label="Anything we should know?"
              name="note"
              value={form.note}
              onChange={(v) => update('note', v)}
              placeholder="Dietary needs, questions, or leave blank..."
              hint="Optional."
            />
            <div className="mt-2">
              <GlassButton type="submit" variant="gold" disabled={submitting}>
                {submitting ? 'Registering…' : 'Register for this event'}
                {!submitting && (
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                )}
              </GlassButton>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
