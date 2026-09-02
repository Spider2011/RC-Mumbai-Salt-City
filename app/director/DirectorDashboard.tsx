'use client';

import { useMemo, useRef, useState } from 'react';
import { CheckCircle2, ClipboardList, ImagePlus, LogOut, X } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { TextField, TextAreaField, SelectField } from '@/components/ui/FormField';
import { compressImage, type CompressedImage } from '@/lib/image-upload';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  AVENUE_OPTIONS,
  MAX_REPORT_PHOTOS,
  validateReport,
  type Avenue,
  type ProjectReportRow,
} from '@/lib/director/schema';
import type { MemberSession } from '@/lib/director/dal';
import { logout, submitReport } from './actions';

const STORAGE_BUCKET = 'project-reports';
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

interface Props {
  director: MemberSession;
  reports: ProjectReportRow[];
}

type FieldErrors = Record<string, string>;

export function DirectorDashboard({ director, reports }: Props) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const defaultAvenue = (AVENUE_OPTIONS as readonly string[]).includes(director.avenue)
    ? (director.avenue as Avenue)
    : '';

  const [title, setTitle] = useState('');
  const [avenue, setAvenue] = useState<string>(defaultAvenue);
  const [projectDate, setProjectDate] = useState('');
  const [location, setLocation] = useState('');
  const [beneficiaries, setBeneficiaries] = useState('');
  const [description, setDescription] = useState('');

  const [photos, setPhotos] = useState<CompressedImage[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function set<K extends string>(key: K, value: string, setter: (v: string) => void) {
    setter(value);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    setPhotoError(null);
    const room = MAX_REPORT_PHOTOS - photos.length;
    if (room <= 0) {
      setPhotoError(`You can attach up to ${MAX_REPORT_PHOTOS} photos.`);
      return;
    }
    setProcessing(true);
    try {
      const next: CompressedImage[] = [];
      for (const file of files.slice(0, room)) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > MAX_UPLOAD_BYTES) continue;
        next.push(await compressImage(file));
      }
      setPhotos((prev) => [...prev, ...next]);
    } catch {
      setPhotoError('Could not process one of those images.');
    } finally {
      setProcessing(false);
    }
  }

  async function uploadPhotos(): Promise<string[]> {
    const paths: string[] = [];
    for (const photo of photos) {
      const blob = await (await fetch(photo.dataUrl)).blob();
      const path = `${director.userId}/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
      if (error) throw new Error(error.message);
      paths.push(path);
    }
    return paths;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const check = validateReport({ title, avenue, projectDate, location, beneficiaries, description });
    if (!check.ok) {
      setErrors(check.errors);
      return;
    }

    setSubmitting(true);
    try {
      const photoPaths = await uploadPhotos();

      const fd = new FormData();
      fd.set('title', title);
      fd.set('avenue', avenue);
      fd.set('projectDate', projectDate);
      fd.set('location', location);
      fd.set('beneficiaries', beneficiaries);
      fd.set('description', description);
      photoPaths.forEach((p) => fd.append('photoPaths', p));

      const res = await submitReport(fd);
      if (res.ok) {
        setDone(true);
      } else if (res.errors) {
        setErrors(res.errors);
      } else {
        setFormError(res.message ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setFormError('Could not upload your photos. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setTitle('');
    setAvenue(defaultAvenue);
    setProjectDate('');
    setLocation('');
    setBeneficiaries('');
    setDescription('');
    setPhotos([]);
    setErrors({});
    setFormError(null);
    setDone(false);
  }

  return (
    <div className="grid gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--text-muted)]">Signed in as</p>
          <h1 className="font-display text-2xl font-light text-[var(--text-primary)]">
            {director.fullName}
          </h1>
          {director.avenue && (
            <p className="text-sm text-[var(--accent-gold)]">{director.avenue}</p>
          )}
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-white/30 hover:text-[var(--text-primary)]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>

      {/* Report form / success */}
      <GlassCard className="p-8 md:p-10" tilt={false} variant="heavy">
        {done ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-[var(--accent-gold)]" strokeWidth={1.5} />
            <h2 className="font-display mt-4 text-2xl font-light text-[var(--text-primary)]">
              Report saved
            </h2>
            <p className="mt-2 max-w-md text-[var(--text-secondary)]">
              Your project has been logged for the club records.
            </p>
            <div className="mt-6">
              <GlassButton type="button" variant="gold" onClick={reset}>
                Report another project
              </GlassButton>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
            <h2 className="font-display text-xl font-light text-[var(--text-primary)]">
              Report a project
            </h2>

            <TextField
              label="Project title"
              name="title"
              value={title}
              onChange={(v) => set('title', v, setTitle)}
              placeholder="e.g. JeevanDaan Blood Donation Drive"
              required
              error={errors.title}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Avenue"
                name="avenue"
                value={avenue}
                onChange={(v) => set('avenue', v, setAvenue)}
                required
                error={errors.avenue}
              >
                <option value="" disabled>
                  Select an avenue…
                </option>
                {AVENUE_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </SelectField>
              <TextField
                label="Date of project"
                name="projectDate"
                type="text"
                value={projectDate}
                onChange={(v) => set('projectDate', v, setProjectDate)}
                placeholder="YYYY-MM-DD"
                required
                error={errors.projectDate}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Location"
                name="location"
                value={location}
                onChange={(v) => set('location', v, setLocation)}
                placeholder="Venue or 'Online'"
                error={errors.location}
              />
              <TextField
                label="People reached"
                name="beneficiaries"
                type="number"
                value={beneficiaries}
                onChange={(v) => set('beneficiaries', v, setBeneficiaries)}
                placeholder="e.g. 120"
                hint="Optional."
                error={errors.beneficiaries}
              />
            </div>

            <TextAreaField
              label="What happened?"
              name="description"
              value={description}
              onChange={(v) => set('description', v, setDescription)}
              placeholder="Describe the project — what you did, who it served, and the outcome."
              rows={6}
              required
              error={errors.description}
            />

            {/* Photos */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                Photos <span className="text-[var(--text-muted)]">(up to {MAX_REPORT_PHOTOS})</span>
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                className="sr-only"
                aria-label="Add photos"
              />
              {photos.length > 0 && (
                <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {photos.map((p, i) => (
                    <div key={p.dataUrl} className="group relative aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.dataUrl}
                        alt={`Photo ${i + 1}`}
                        className="h-full w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                        aria-label="Remove photo"
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {photos.length < MAX_REPORT_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={processing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-5 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-gold)]/40 hover:text-[var(--text-primary)] disabled:opacity-50"
                >
                  <ImagePlus className="h-5 w-5 text-[var(--accent-gold)]" />
                  {processing ? 'Processing…' : 'Add photos'}
                </button>
              )}
              {photoError && (
                <p className="mt-1.5 text-xs text-[var(--accent-sunrise-from)]" role="alert">
                  {photoError}
                </p>
              )}
            </div>

            {formError && (
              <p className="text-sm text-[var(--accent-sunrise-from)]" role="alert">
                {formError}
              </p>
            )}

            <div className="mt-1">
              <GlassButton type="submit" variant="gold" disabled={submitting}>
                {submitting ? 'Saving…' : 'Submit report'}
              </GlassButton>
            </div>
          </form>
        )}
      </GlassCard>

      {/* Recent reports */}
      <div>
        <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-light text-[var(--text-primary)]">
          <ClipboardList className="h-5 w-5 text-[var(--accent-gold)]" />
          Your recent reports
        </h2>
        {reports.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No reports yet — your first one will show here.</p>
        ) : (
          <ul className="grid gap-3">
            {reports.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div>
                  <p className="text-[var(--text-primary)]">{r.title}</p>
                  <p className="text-xs text-[var(--accent-gold)]">{r.avenue}</p>
                </div>
                <span className="text-xs text-[var(--text-muted)]">
                  {r.project_date ?? new Date(r.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
