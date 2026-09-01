/**
 * Reads the Supabase connection details from the environment.
 *
 * These are the *public* project URL and anon key — safe to expose to the
 * browser. All real protection comes from Supabase Auth + Row Level Security,
 * so the anon key alone cannot read or write another director's data.
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
  return { url, anonKey };
}
