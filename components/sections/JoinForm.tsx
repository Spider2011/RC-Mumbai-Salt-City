'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { TextField, TextAreaField, SelectField } from '@/components/ui/FormField';
import { AVENUES } from '@/lib/constants';
import { submitToSheet } from '@/lib/submit-form';

interface FormState {
  name: string;
  email: string;
  phone: string;
  avenue: string;
  why: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s-]{7,}$/;

export function JoinForm() {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    avenue: '',
    why: '',
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
    if (!form.avenue) next.avenue = 'Choose an avenue that calls to you.';
    if (form.why.trim().length < 10) next.why = 'A sentence or two, at least.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const [failed, setFailed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setFailed(false);
    try {
      await submitToSheet('Join', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        avenue: form.avenue,
        why: form.why,
      });
      setDone(true);
    } catch {
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
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
              Welcome to the continuum.
            </h2>
            <p className="mt-3 max-w-md text-[var(--text-secondary)]">
              Thank you, {form.name.split(' ')[0]}. We&apos;ve received your interest and will reach
              out soon. Your beginning starts now.
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
              <SelectField
                label="Avenue of interest"
                name="avenue"
                value={form.avenue}
                onChange={(v) => update('avenue', v)}
                required
                error={errors.avenue}
              >
                <option value="" disabled>
                  Select an avenue
                </option>
                {AVENUES.map((a) => (
                  <option key={a.id} value={a.title}>
                    {a.title}
                  </option>
                ))}
              </SelectField>
            </div>
            <TextAreaField
              label="Why do you want to serve?"
              name="why"
              value={form.why}
              onChange={(v) => update('why', v)}
              placeholder="Tell us what draws you to Rotaract..."
              required
              error={errors.why}
              hint="A few honest sentences are perfect."
            />
            <div className="mt-2">
              <GlassButton type="submit" variant="gold" disabled={submitting}>
                {submitting ? 'Sending…' : 'Submit Application'}
                {!submitting && (
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                )}
              </GlassButton>
              {failed && (
                <p className="mt-3 text-sm text-[var(--accent-sunrise-from)]" role="alert">
                  Something went wrong sending your application. Please try again.
                </p>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
