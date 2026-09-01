'use client';

import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from './config';

/**
 * Supabase client for the browser. Shares the same auth-session cookies as the
 * server client, so a director who logged in via the server action is also
 * authenticated here — used for uploading project photos straight to Storage.
 */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createBrowserClient(url, anonKey);
}
