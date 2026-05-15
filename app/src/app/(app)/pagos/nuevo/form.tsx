'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input, EnumPicker, Field } from '@/components/ui';
import { FormFooter, FormError } from '@/components/shared/form-footer';

const CATEGORIAS = ['vivienda', 'servicios', 'suscripciones', 'transporte', 'otros'] as const;
const RECUR_UNITS = ['days', 'weeks', 'months', 'years'] as const;
const RECUR_LABELS = { days: 'días', weeks: 'sem', months: 'meses', years: 'años' };

type Cat = (typeof CATEGORIAS)[number];

export function NewPagoForm({
  coupleId,
  users,
}: {
  coupleId: string;
  users: { id: string; display_name: string | null }[];
}) {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState<number | ''>('');
  const [categoria, setCategoria] = useState<Cat | null>(null);
  const [pagador, setPagador] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [recurValue, setRecurValue] = useState<number | ''>('');
  const [recurUnit, setRecurUnit] = useState<typeof RECUR_UNITS[number]>('months');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !monto) {
      setError('Llena nombre y monto.');
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from('pagos').insert({
      couple_id: coupleId,
      nombre,
      monto: Number(monto),
      categoria,
      pagador_asignado: pagador || null,
      recurrencia: recurValue ? { value: Number(recurValue), unit: recurUnit } : null,
      due_date: dueDate || null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/pagos');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Concepto">
        <Input
          required
          placeholder="CFE · luz"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
      </Field>

      <Field label="Monto (MXN)">
        <Input
          type="number"
          min="0"
          step="0.01"
          required
          placeholder="2400"
          value={monto}
          onChange={e => setMonto(e.target.value === '' ? '' : Number(e.target.value))}
        />
      </Field>

      <Field label="Categoría">
        <EnumPicker options={CATEGORIAS} value={categoria} onChange={setCategoria} />
      </Field>

      {users.length > 0 && (
        <Field label="Pagador asignado">
          <select
            value={pagador}
            onChange={e => setPagador(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3.5 py-3 text-[15px]"
          >
            <option value="">Sin asignar</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.display_name ?? u.id}</option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Fecha de vencimiento">
        <Input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />
      </Field>

      <Field label="Recurrencia (opcional)" hint="Si es pago recurrente. El trigger regenera la siguiente ocurrencia al marcar pagado.">
        <div className="flex gap-2">
          <Input
            type="number"
            min="1"
            placeholder="1"
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

      <FormError message={error} />

      <FormFooter
        loading={loading}
        submitDisabled={!nombre || !monto}
        submitLabel="Crear pago"
      />
    </form>
  );
}
