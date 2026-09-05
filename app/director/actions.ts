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

export interface DeleteResult {
  ok: boolean;
  error?: string;
}

/**
 * Delete a project report. Restricted to admins (President / Secretary) — the
 * check here mirrors the database RLS delete policy. Also removes the report's
 * photos and document from Storage.
 */
export async function deleteReport(reportId: string): Promise<DeleteResult> {
  const member = await getMember();
  if (!member.isAdmin) return { ok: false, error: 'You are not allowed to delete reports.' };
  if (!reportId) return { ok: false, error: 'Missing report id.' };

  const supabase = await createSupabaseServerClient();

  const { data: row } = await supabase
    .from('project_reports')
    .select('photo_paths, report_doc')
    .eq('id', reportId)
    .single();

  const paths = [
    ...((row?.photo_paths as string[] | null) ?? []),
    ...(row?.report_doc ? [row.report_doc as string] : []),
  ].filter(Boolean);
  if (paths.length > 0) {
    await supabase.storage.from('project-reports').remove(paths);
  }

  const { error } = await supabase.from('project_reports').delete().eq('id', reportId);
  if (error) return { ok: false, error: 'Could not delete the report. Please try again.' };

  revalidatePath('/director');
  return { ok: true };
}

export interface PasswordState {
  ok?: boolean;
  error?: string;
}

/** Let the signed-in member set a new password for their own account. */
export async function changePassword(
  _prev: PasswordState,
  formData: FormData
): Promise<PasswordState> {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (password !== confirm) return { error: 'The two passwords do not match.' };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Your session has expired. Please sign in again.' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message || 'Could not update your password. Please try again.' };

  return { ok: true };
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

  const reportDoc = String(formData.get('reportDoc') ?? '').trim();
  if (!reportDoc) {
    return { ok: false, errors: { reportDoc: 'Please attach your report document.' } };
  }

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
    report_doc: reportDoc,
  });

  if (error) {
    return { ok: false, message: 'Could not save your report. Please try again.' };
  }

  revalidatePath('/director');
  return { ok: true };
}
