import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { MemberRole } from '@/lib/director/schema';

export interface MemberSession {
  userId: string;
  email: string;
  fullName: string;
  avenue: string;
  role: MemberRole;
  /** President / Secretary — may delete reports. */
  isAdmin: boolean;
}

/**
 * The portal's Data Access Layer. Verifies the Supabase auth session and loads
 * the member's profile (name, avenue, role). Redirects to the login page if
 * there is no valid session, so every caller is guaranteed an authenticated
 * member.
 *
 * `cache` memoizes the result within a single render/request pass so the auth
 * check and profile lookup run at most once per request.
 */
export const getMember = cache(async (): Promise<MemberSession> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/director/login');

  const { data: profile } = await supabase
    .from('members')
    .select('full_name, avenue, role, is_admin')
    .eq('id', user.id)
    .single();

  return {
    userId: user.id,
    email: user.email ?? '',
    fullName: profile?.full_name ?? user.email ?? 'Member',
    avenue: profile?.avenue ?? '',
    role: profile?.role === 'core' ? 'core' : 'director',
    isAdmin: profile?.is_admin === true,
  };
});
