import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface DirectorSession {
  userId: string;
  email: string;
  fullName: string;
  avenue: string;
}

/**
 * The portal's Data Access Layer. Verifies the Supabase auth session and loads
 * the director's profile (name + avenue). Redirects to the login page if there
 * is no valid session, so every caller is guaranteed an authenticated director.
 *
 * `cache` memoizes the result within a single render/request pass so the auth
 * check and profile lookup run at most once per request.
 */
export const getDirector = cache(async (): Promise<DirectorSession> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/director/login');

  const { data: profile } = await supabase
    .from('directors')
    .select('full_name, avenue')
    .eq('id', user.id)
    .single();

  return {
    userId: user.id,
    email: user.email ?? '',
    fullName: profile?.full_name ?? user.email ?? 'Director',
    avenue: profile?.avenue ?? '',
  };
});
