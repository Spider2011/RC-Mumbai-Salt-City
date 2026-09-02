'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMember } from '@/lib/director/dal';
import { validateReport, MAX_REPORT_PHOTOS, type ReportResult } from '@/lib/director/schema';

export interface LoginState {
  error?: string;
}

/** Sign a director in with email + password. Redirects to the portal on success. */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) return { error: 'Enter your email and password.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: 'Invalid email or password.' };

  redirect('/director');
}

/** Sign the current director out. */
export async function logout(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/director/login');
}

/**
 * Save a project report for the logged-in director. Photos are uploaded to
 * Storage from the browser first; their paths arrive here as `photoPaths`.
 * Re-validates on the server (the real gate) before inserting.
 */
export async function submitReport(formData: FormData): Promise<ReportResult> {
  const director = await getMember(); // redirects if the session is gone

  const result = validateReport({
    title: String(formData.get('title') ?? ''),
    avenue: String(formData.get('avenue') ?? ''),
    projectDate: String(formData.get('projectDate') ?? ''),
    location: String(formData.get('location') ?? ''),
    beneficiaries: String(formData.get('beneficiaries') ?? ''),
    description: String(formData.get('description') ?? ''),
  });

  if (!result.ok) return { ok: false, errors: result.errors };

  const photoPaths = formData
    .getAll('photoPaths')
    .map((p) => String(p))
    .filter(Boolean)
    .slice(0, MAX_REPORT_PHOTOS);

  const v = result.value;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('project_reports').insert({
    director_id: director.userId,
    director_name: director.fullName,
    avenue: v.avenue,
    title: v.title,
    project_date: v.projectDate,
    location: v.location,
    beneficiaries: v.beneficiaries,
    description: v.description,
    photo_paths: photoPaths,
  });

  if (error) {
    return { ok: false, message: 'Could not save your report. Please try again.' };
  }

  revalidatePath('/director');
  return { ok: true };
}
