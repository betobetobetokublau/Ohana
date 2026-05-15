'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input, EnumPicker, Field, Checkbox } from '@/components/ui';
import { FormFooter, FormError } from '@/components/shared/form-footer';
import { RecurrencePicker, type RecurrenceValue } from '@/components/shared/recurrence-picker';

const CATEGORIAS = ['vivienda', 'servicios', 'suscripciones', 'transporte', 'otros'] as const;
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
  const [variableMonto, setVariableMonto] = useState(false);
  const [categoria, setCategoria] = useState<Cat | null>(null);
  const [pagador, setPagador] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [recurrencia, setRecurrencia] = useState<RecurrenceValue>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre) {
      setError('Pon nombre.');
      return;
    }
    if (!variableMonto && !monto) {
      setError('Pon un monto o márcalo como variable.');
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from('pagos').insert({
      couple_id: coupleId,
      nombre,
      monto: variableMonto ? 0 : Number(monto), // monto 0 cuando es variable · UI mostrará el del último instancia
      monto_variable: variableMonto,
      categoria,
      pagador_asignado: pagador || null,
      recurrencia,
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

      <Field
        label={variableMonto ? 'Monto · variable cada mes' : 'Monto (MXN)'}
        hint={
          variableMonto
            ? 'El monto se captura cada vez que registras un pago. Útil para luz, agua, teléfono.'
            : 'Monto fijo. Si cambia cada mes, marca la opción de abajo.'
        }
      >
        <Input
          type="number"
          min="0"
          step="0.01"
          required={!variableMonto}
          disabled={variableMonto}
          placeholder={variableMonto ? 'Se captura al pagar' : '2400'}
          value={variableMonto ? '' : monto}
          onChange={e => setMonto(e.target.value === '' ? '' : Number(e.target.value))}
        />
      </Field>

      <label className="flex items-center gap-2 cursor-pointer">
        <Checkbox checked={variableMonto} onCheckedChange={v => setVariableMonto(v === true)} />
        <span className="text-[14px]">Monto variable (cada pago tiene su propio monto)</span>
      </label>

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

      <RecurrencePicker
        value={recurrencia}
        onChange={setRecurrencia}
        hint="Para pagos recurrentes. El trigger crea la siguiente ocurrencia al marcar pagado."
      />

      <FormError message={error} />

      <FormFooter
        loading={loading}
        submitDisabled={!nombre || (!variableMonto && !monto)}
        submitLabel="Crear pago"
      />
    </form>
  );
}
