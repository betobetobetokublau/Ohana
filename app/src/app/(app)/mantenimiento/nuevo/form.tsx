'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input, Textarea, EnumPicker, Field } from '@/components/ui';
import { FormFooter, FormError } from '@/components/shared/form-footer';

const RECUR_UNITS = ['days', 'weeks', 'months', 'years'] as const;
const RECUR_LABELS = { days: 'días', weeks: 'sem', months: 'meses', years: 'años' };

export function NewMantForm({
  coupleId,
  users,
}: {
  coupleId: string;
  users: { id: string; display_name: string | null }[];
}) {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [asignado, setAsignado] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [recurrente, setRecurrente] = useState(false);
  const [recurValue, setRecurValue] = useState<number | ''>('');
  const [recurUnit, setRecurUnit] = useState<typeof RECUR_UNITS[number]>('months');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from('accionables').insert({
      couple_id: coupleId,
      tipo: 'mantenimiento',
      titulo,
      descripcion: descripcion.trim() || null,
      asignado_user_id: asignado || null,
      due_date: dueDate || null,
      recurrencia: recurrente && recurValue
        ? { value: Number(recurValue), unit: recurUnit }
        : null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/mantenimiento');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Tarea">
        <Input
          required
          placeholder="Cambiar filtros AC"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
        />
      </Field>

      <Field label="Descripción (opcional)">
        <Textarea
          rows={2}
          placeholder="Filtros del AC del cuarto principal"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
        />
      </Field>

      {users.length > 0 && (
        <Field label="Asignado a">
          <select
            value={asignado}
            onChange={e => setAsignado(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3.5 py-3 text-[15px]"
          >
            <option value="">Sin asignar</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.display_name ?? u.id}</option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Fecha límite">
        <Input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />
      </Field>

      <Field label="¿Recurrente?">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRecurrente(false)}
            className={`flex-1 py-3 rounded-sm border text-[13px] font-semibold uppercase tracking-wider ${
              !recurrente ? 'bg-ink text-bg border-ink' : 'bg-surface border-line'
            }`}
          >
            Única
          </button>
          <button
            type="button"
            onClick={() => setRecurrente(true)}
            className={`flex-1 py-3 rounded-sm border text-[13px] font-semibold uppercase tracking-wider ${
              recurrente ? 'bg-ink text-bg border-ink' : 'bg-surface border-line'
            }`}
          >
            Recurrente
          </button>
        </div>
      </Field>

      {recurrente && (
        <Field label="Cada">
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              placeholder="6"
              value={recurValue}
              onChange={e => setRecurValue(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-24"
            />
            <EnumPicker
              options={RECUR_UNITS}
              value={recurUnit}
              onChange={setRecurUnit}
              labelMap={RECUR_LABELS}
            />
          </div>
        </Field>
      )}

      <FormError message={error} />

      <FormFooter
        loading={loading}
        submitDisabled={!titulo}
        submitLabel="Crear tarea"
      />
    </form>
  );
}
