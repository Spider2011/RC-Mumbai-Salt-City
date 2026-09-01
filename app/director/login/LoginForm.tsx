'use client';

import { useActionState, useState } from 'react';
import { Lock } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { TextField } from '@/components/ui/FormField';
import { login, type LoginState } from '../actions';

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <GlassCard className="p-8 md:p-10" tilt={false} variant="heavy">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--accent-gold)]/40 bg-[var(--accent-gold)]/10">
          <Lock className="h-5 w-5 text-[var(--accent-gold)]" strokeWidth={1.5} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-light text-[var(--text-primary)]">
            Director Portal
          </h1>
          <p className="text-sm text-[var(--text-muted)]">Sign in to report a project.</p>
        </div>
      </div>

      {!configured ? (
        <p className="rounded-xl border border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/[0.06] px-4 py-3 text-sm text-[var(--text-secondary)]">
          The portal isn&apos;t connected yet. Add the Supabase environment variables and reload.
        </p>
      ) : (
        <form action={action} className="grid gap-5" noValidate>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            required
          />
          {state?.error && (
            <p className="text-sm text-[var(--accent-sunrise-from)]" role="alert">
              {state.error}
            </p>
          )}
          <GlassButton type="submit" variant="gold" disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in'}
          </GlassButton>
        </form>
      )}
    </GlassCard>
  );
}
