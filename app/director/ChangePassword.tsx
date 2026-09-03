'use client';

import { useActionState, useState } from 'react';
import { KeyRound, CheckCircle2, ChevronDown } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { TextField } from '@/components/ui/FormField';
import { changePassword, type PasswordState } from './actions';

export function ChangePassword() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePassword, {});
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  return (
    <GlassCard className="p-6" tilt={false}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex items-center gap-2 text-[var(--text-primary)]">
          <KeyRound className="h-5 w-5 text-[var(--accent-gold)]" />
          Change password
        </span>
        <ChevronDown
          className={`h-5 w-5 text-[var(--text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="mt-5">
          {state?.ok ? (
            <p className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <CheckCircle2 className="h-5 w-5 text-[var(--accent-gold)]" />
              Your password has been updated.
            </p>
          ) : (
            <form action={action} className="grid max-w-md gap-4" noValidate>
              <TextField
                label="New password"
                name="password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="At least 8 characters"
                required
              />
              <TextField
                label="Confirm new password"
                name="confirm"
                type="password"
                value={confirm}
                onChange={setConfirm}
                placeholder="Re-enter the password"
                required
              />
              {state?.error && (
                <p className="text-sm text-[var(--accent-sunrise-from)]" role="alert">
                  {state.error}
                </p>
              )}
              <div>
                <GlassButton type="submit" variant="gold" disabled={pending}>
                  {pending ? 'Updating…' : 'Update password'}
                </GlassButton>
              </div>
            </form>
          )}
        </div>
      )}
    </GlassCard>
  );
}
