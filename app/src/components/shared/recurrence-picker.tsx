'use client';

import { Field } from '@/components/ui';

/**
 * Selector de recurrencia unificado · dropdown con presets comunes + opción "no".
 * Usado en Pagos, Mantenimiento, Fechas clave.
 *
 * Output: `{ value: number, unit: 'days'|'weeks'|'months'|'years' } | null`.
 */

export type RecurrenceValue = { value: number; unit: 'days' | 'weeks' | 'months' | 'years' } | null;

const PRESETS: { label: string; value: RecurrenceValue }[] = [
  { label: 'Sin recurrencia', value: null },
  { label: 'Cada día', value: { value: 1, unit: 'days' } },
  { label: 'Cada semana', value: { value: 1, unit: 'weeks' } },
  { label: 'Cada 2 semanas', value: { value: 2, unit: 'weeks' } },
  { label: 'Cada mes', value: { value: 1, unit: 'months' } },
  { label: 'Cada 2 meses', value: { value: 2, unit: 'months' } },
  { label: 'Cada 3 meses', value: { value: 3, unit: 'months' } },
  { label: 'Cada 6 meses', value: { value: 6, unit: 'months' } },
  { label: 'Cada año', value: { value: 1, unit: 'years' } },
];

function valueToKey(v: RecurrenceValue): string {
  if (!v) return 'none';
  return `${v.value}_${v.unit}`;
}

function keyToValue(key: string): RecurrenceValue {
  if (key === 'none') return null;
  const preset = PRESETS.find(p => valueToKey(p.value) === key);
  return preset?.value ?? null;
}

interface RecurrencePickerProps {
  label?: string;
  hint?: string;
  value: RecurrenceValue;
  onChange: (value: RecurrenceValue) => void;
}

export function RecurrencePicker({ label = 'Recurrencia', hint, value, onChange }: RecurrencePickerProps) {
  return (
    <Field label={label} hint={hint}>
      <select
        value={valueToKey(value)}
        onChange={e => onChange(keyToValue(e.target.value))}
        className="w-full rounded-md border border-line bg-surface px-3.5 py-3 text-[15px] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
      >
        {PRESETS.map(p => (
          <option key={valueToKey(p.value)} value={valueToKey(p.value)}>
            {p.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
