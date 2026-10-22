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
  birthDate: string;
  email: string;
  phone: string;
  gender: string;
  bloodGroup: string;
  occupation: string;
  designation: string;
  years: string;
  avenue: string;
  why: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s-]{7,}$/;
const YEARS_RE = /^\d{1,2}$/;

const GENDERS = ['Male', 'Female', 'Others', 'Prefer not to say'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', "Don't know"];
const WORKING = 'Working Professional';
const OCCUPATIONS = ['Student', WORKING];

/** `YYYY-MM-DD` (date input) is a real past date after 1920. */
function isValidBirthDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && date < new Date() && date.getFullYear() > 1920;
}

export function JoinForm() {
  const [form, setForm] = useState<FormState>({
    name: '',
    birthDate: '',
    email: '',
    phone: '',
    gender: '',
    bloodGroup: '',
    occupation: '',
    designation: '',
    years: '',
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

  const isWorking = form.occupation === WORKING;

  function validate(): boolean {
    const next: Errors = {};
    if (!form.name.trim()) next.name = 'Please tell us your name.';
    if (!isValidBirthDate(form.birthDate)) next.birthDate = 'Enter your date of birth.';
    if (!EMAIL_RE.test(form.email)) next.email = 'Enter a valid email address.';
    if (!PHONE_RE.test(form.phone)) next.phone = 'Enter a valid phone number.';
    if (!form.gender) next.gender = 'Please choose an option.';
    if (!form.bloodGroup) next.bloodGroup = 'Choose your blood group, or "Don’t know".';
    if (!form.occupation) next.occupation = 'Are you a student or working?';
    if (isWorking && !form.designation.trim()) next.designation = 'What is your designation?';
    if (!YEARS_RE.test(form.years.trim())) next.years = 'Enter a whole number, e.g. 0 if you are new.';
    if (!form.avenue) next.avenue = 'Choose an avenue that calls to you.';
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
        birthDate: form.birthDate.replaceAll('-', '/'),
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        occupation: isWorking ? `${WORKING} - ${form.designation.trim()}` : form.occupation,
        yearsInRotaract: Number(form.years),
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
                label="Date of birth"
                name="birthDate"
                type="date"
                value={form.birthDate}
                onChange={(v) => update('birthDate', v)}
                required
                error={errors.birthDate}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
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
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Gender"
                name="gender"
                value={form.gender}
                onChange={(v) => update('gender', v)}
                required
                error={errors.gender}
              >
                <option value="" disabled>
                  Select
                </option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Blood group"
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={(v) => update('bloodGroup', v)}
                required
                error={errors.bloodGroup}
              >
                <option value="" disabled>
                  Select
                </option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </SelectField>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Student / Working professional"
                name="occupation"
                value={form.occupation}
                onChange={(v) => update('occupation', v)}
                required
                error={errors.occupation}
              >
                <option value="" disabled>
                  Select
                </option>
                {OCCUPATIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </SelectField>
              {isWorking && (
                <TextField
                  label="Designation"
                  name="designation"
                  value={form.designation}
                  onChange={(v) => update('designation', v)}
                  placeholder="e.g. Software Engineer"
                  required
                  error={errors.designation}
                />
              )}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Years in Rotaract"
                name="years"
                type="number"
                value={form.years}
                onChange={(v) => update('years', v)}
                placeholder="0"
                required
                error={errors.years}
                hint="Enter 0 if you're new to Rotaract."
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
              error={errors.why}
              hint="Optional, but a few honest sentences help us get to know you."
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
