'use client';

import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BaseProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
}

interface InputProps extends BaseProps {
  type?: 'text' | 'email' | 'tel' | 'url';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface TextareaProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

interface SelectProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}

const fieldClasses =
  'w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-colors duration-200 focus:border-[var(--accent-gold)]/60 focus:bg-white/[0.06] min-h-[44px]';

function Label({ htmlFor, label, required }: { htmlFor: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
      {label}
      {required && <span className="ml-1 text-[var(--accent-magenta)]">*</span>}
    </label>
  );
}

function FieldShell({
  id,
  label,
  required,
  error,
  hint,
  className,
  children,
}: BaseProps & { id: string; children: ReactNode }) {
  return (
    <div className={className}>
      <Label htmlFor={id} label={label} required={required} />
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-[var(--text-muted)]">{hint}</p>}
      {error && (
        <p className="mt-1.5 text-xs text-[var(--accent-sunrise-from)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({ type = 'text', value, onChange, placeholder, ...rest }: InputProps) {
  const id = useId();
  return (
    <FieldShell id={id} {...rest}>
      <input
        id={id}
        name={rest.name}
        type={type}
        value={value}
        required={rest.required}
        placeholder={placeholder}
        aria-invalid={Boolean(rest.error)}
        onChange={(e) => onChange(e.target.value)}
        className={cn(fieldClasses, rest.error && 'border-[var(--accent-sunrise-from)]/60')}
      />
    </FieldShell>
  );
}

export function TextAreaField({ value, onChange, placeholder, rows = 5, ...rest }: TextareaProps) {
  const id = useId();
  return (
    <FieldShell id={id} {...rest}>
      <textarea
        id={id}
        name={rest.name}
        value={value}
        rows={rows}
        required={rest.required}
        placeholder={placeholder}
        aria-invalid={Boolean(rest.error)}
        onChange={(e) => onChange(e.target.value)}
        className={cn(fieldClasses, 'resize-none', rest.error && 'border-[var(--accent-sunrise-from)]/60')}
      />
    </FieldShell>
  );
}

export function SelectField({ value, onChange, children, ...rest }: SelectProps) {
  const id = useId();
  return (
    <FieldShell id={id} {...rest}>
      <select
        id={id}
        name={rest.name}
        value={value}
        required={rest.required}
        aria-invalid={Boolean(rest.error)}
        onChange={(e) => onChange(e.target.value)}
        className={cn(fieldClasses, 'cursor-pointer appearance-none', rest.error && 'border-[var(--accent-sunrise-from)]/60')}
      >
        {children}
      </select>
    </FieldShell>
  );
}
