'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input, Textarea, EnumPicker, Field } from '@/components/ui';
import { FormFooter, FormError } from '@/components/shared/form-footer';

const TIPOS = ['evento', 'salida'] as const;
const TIPO_LABELS = { evento: 'evento · casa', salida: 'salida · fuera' };

export function NewEventoForm({ coupleId }: { coupleId: string }) {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<'evento' | 'salida' | null>('evento');
  const [fecha, setFecha] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from('saludsexual_eventos').insert({
      couple_id: coupleId,
      nombre_actividad: nombre || null,
      tipo,
      fecha: fecha || null,
      descripcion: descripcion.trim() || null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/salud-sexual');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Nombre (opcional)">
        <Input
          placeholder="Tarde de domingo"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
      </Field>

      <Field label="Tipo">
        <EnumPicker options={TIPOS} value={tipo} onChange={setTipo} labelMap={TIPO_LABELS} />
      </Field>

      <Field label="Fecha">
        <Input
          type="datetime-local"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
        />
      </Field>

      <Field label="Nota (opcional)">
        <Textarea
          rows={3}
          placeholder="Domingo lento. Después del desayuno tarde…"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
        />
      </Field>

      <FormError message={error} />

      <FormFooter
        loading={loading}
        submitLabel="Registrar"
      />
    </form>
  );
}
