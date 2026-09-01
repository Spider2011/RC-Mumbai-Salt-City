'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, ImagePlus, X } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { TextField } from '@/components/ui/FormField';
import { submitToSheet } from '@/lib/submit-form';
import { compressImage, type CompressedImage } from '@/lib/image-upload';

interface EventRegisterFormProps {
  eventTitle: string;
  /** Show an optional photo-upload field. */
  collectImage?: boolean;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  guests: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s-]{7,}$/;
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12MB before compression

export function EventRegisterForm({ eventTitle, collectImage = false }: EventRegisterFormProps) {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    guests: '1',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

  const [image, setImage] = useState<CompressedImage | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    setImageError(null);
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setImageError('That image is too large (max 12MB).');
      return;
    }
    setProcessingImage(true);
    try {
      setImage(await compressImage(file));
    } catch {
      setImageError('Could not process that image. Try another.');
    } finally {
      setProcessingImage(false);
    }
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
    const validFields = validate();
    if (collectImage && !image) {
      setImageError('Please upload your payment proof to register.');
    }
    if (!validFields || (collectImage && !image)) return;
    setSubmitting(true);
    setFailed(false);
    try {
      // Routes to a tab named after the event. When a photo is attached, the
      // Apps Script saves it to Drive and stores the link.
      await submitToSheet(eventTitle, {
        event: eventTitle,
        name: form.name,
        email: form.email,
        phone: form.phone,
        attendees: form.guests,
        ...(image
          ? { _imageData: image.base64, _imageName: image.name, _imageType: image.type }
          : {}),
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

            {collectImage && (
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                  Upload your payment proof <span className="text-[var(--accent-gold)]">*</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="sr-only"
                  aria-label="Add a photo"
                />
                {image ? (
                  <div className="flex items-center gap-4 rounded-xl border border-white/15 bg-white/[0.04] p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.dataUrl}
                      alt="Selected preview"
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <span className="flex-1 truncate text-sm text-[var(--text-secondary)]">
                      {image.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      aria-label="Remove photo"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-white/10 hover:text-[var(--text-primary)]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={processingImage}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-6 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-gold)]/40 hover:text-[var(--text-primary)] disabled:opacity-50"
                  >
                    <ImagePlus className="h-5 w-5 text-[var(--accent-gold)]" />
                    {processingImage ? 'Processing…' : 'Upload payment proof'}
                  </button>
                )}
                {imageError && (
                  <p className="mt-1.5 text-xs text-[var(--accent-sunrise-from)]" role="alert">
                    {imageError}
                  </p>
                )}
              </div>
            )}

            <div className="mt-2">
              <GlassButton type="submit" variant="gold" disabled={submitting}>
                {submitting ? 'Registering…' : 'Register for this event'}
                {!submitting && (
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                )}
              </GlassButton>
              {failed && (
                <p className="mt-3 text-sm text-[var(--accent-sunrise-from)]" role="alert">
                  Something went wrong with your registration. Please try again.
                </p>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
