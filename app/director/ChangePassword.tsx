'use client';

import { useActionState, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, CheckCircle2, X } from 'lucide-react';
import { GlassButton } from '@/components/ui/GlassButton';
import { TextField } from '@/components/ui/FormField';
import { Portal } from '@/components/ui/Portal';
import { changePassword, type PasswordState } from './actions';

export function ChangePassword() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePassword, {});
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  // Close on Escape and lock background scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-white/30 hover:text-[var(--text-primary)]"
      >
        <KeyRound className="h-4 w-4" />
        Password
      </button>

      <Portal>
      <AnimatePresence>
        {open && (
          <motion.div
            data-lenis-prevent
            className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Change password"
          >
            <motion.div
              className="relative my-auto w-full max-w-md rounded-2xl border border-white/12 bg-[#0e1322] p-6 shadow-2xl sm:p-8"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-white/10 hover:text-[var(--text-primary)]"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-5 flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-[var(--accent-gold)]" />
                <h2 className="font-display text-xl font-light text-[var(--text-primary)]">
                  Change password
                </h2>
              </div>

              {state?.ok ? (
                <div className="flex flex-col items-center py-4 text-center">
                  <CheckCircle2 className="h-10 w-10 text-[var(--accent-gold)]" strokeWidth={1.5} />
                  <p className="mt-3 text-[var(--text-secondary)]">Your password has been updated.</p>
                  <div className="mt-5">
                    <GlassButton type="button" variant="gold" onClick={() => setOpen(false)}>
                      Done
                    </GlassButton>
                  </div>
                </div>
              ) : (
                <form action={action} className="grid gap-4" noValidate>
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
                  <div className="mt-1">
                    <GlassButton type="submit" variant="gold" disabled={pending}>
                      {pending ? 'Updating…' : 'Update password'}
                    </GlassButton>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>
    </>
  );
}
