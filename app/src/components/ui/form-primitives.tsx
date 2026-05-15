'use client';

import { cn } from '@/lib/utils/cn';

/**
 * Scale10 · selector 1-10 grid · usado en checkin (energía, deseo) y partner-rating.
 */
export function Scale10({
  value,
  onChange,
  disabled,
}: {
  value: number | null;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-10 gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          disabled={disabled}
          className={cn(
            'aspect-square rounded-sm border font-mono text-[14px] font-medium transition-colors',
            value === n
              ? 'bg-ink text-bg border-ink'
              : 'bg-surface text-ink border-line hover:border-line-2'
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

/**
 * Scale5 · estrellas/calificación 1-5 · usado en citas rating + wishlist interés.
 */
export function Scale5({
  value,
  onChange,
  disabled,
}: {
  value: number | null;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          disabled={disabled}
          className={cn(
            'w-12 h-12 rounded-sm border font-mono text-[16px] font-medium transition-colors flex items-center justify-center',
            value === n
              ? 'bg-accent text-white border-accent'
              : 'bg-surface text-ink border-line hover:border-line-2'
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

/**
 * EnumPicker · grid 4-col para enums tipo presión laboral, categorías.
 */
export function EnumPicker<T extends string>({
  options,
  value,
  onChange,
  disabled,
  labelMap,
}: {
  options: readonly T[];
  value: T | null;
  onChange: (v: T) => void;
  disabled?: boolean;
  /** Mapa opcional para labels más amigables (key → label visible). */
  labelMap?: Record<string, string>;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          disabled={disabled}
          className={cn(
            'py-2.5 rounded-sm border text-[12px] font-semibold uppercase tracking-wider transition-colors',
            value === opt
              ? 'bg-ink text-bg border-ink'
              : 'bg-surface text-ink border-line hover:border-line-2'
          )}
        >
          {labelMap?.[opt] ?? opt}
        </button>
      ))}
    </div>
  );
}

/**
 * Field · wrapper consistente label + input.
 */
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-sans font-semibold uppercase tracking-[0.08em] text-muted mb-2">
        {label}
      </label>
      {children}
      {hint && <p className="meta mt-1.5">{hint}</p>}
    </div>
  );
}
