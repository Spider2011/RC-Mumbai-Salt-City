import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseConfig } from './config';

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Reads/writes the auth session from Next's cookie store so the logged-in
 * director is carried across requests.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Session cookie (no expiry) so members are signed out on browser
            // close; keep expiry only for deletions (empty value → sign-out).
            const opts = { ...options };
            if (value) {
              delete opts.maxAge;
              delete opts.expires;
            }
            cookieStore.set(name, value, opts);
          });
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // The proxy (middleware) refreshes the session cookie instead.
        }
      },
    },
  });
}
