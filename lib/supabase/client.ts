'use client';

import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from './config';

/** Read all browser cookies as {name, value} pairs. */
function readCookies(): { name: string; value: string }[] {
  if (typeof document === 'undefined' || !document.cookie) return [];
  return document.cookie.split('; ').map((pair) => {
    const eq = pair.indexOf('=');
    return {
      name: pair.slice(0, eq),
      value: decodeURIComponent(pair.slice(eq + 1)),
    };
  });
}

/**
 * Supabase client for the browser.
 *
 * We manage cookies ourselves so auth cookies are written as SESSION cookies
 * (no Max-Age / Expires) — they are cleared when the browser is closed, so a
 * member is signed out on close rather than staying logged in indefinitely.
 * Deletions (empty value) still write Max-Age=0 so sign-out removes them.
 */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabaseConfig();

  return createBrowserClient(url, anonKey, {
    cookies: {
      getAll() {
        return readCookies();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          const path = options?.path ?? '/';
          const sameSite = options?.sameSite ?? 'lax';
          let str = `${name}=${encodeURIComponent(value)}; Path=${path}; SameSite=${sameSite}`;
          if (typeof location !== 'undefined' && location.protocol === 'https:') str += '; Secure';
          if (!value) str += '; Max-Age=0'; // deletion (sign-out)
          // else: no Max-Age/Expires → session cookie, cleared on browser close
          document.cookie = str;
        }
      },
    },
  });
}
