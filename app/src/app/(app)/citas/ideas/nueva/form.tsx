'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input, EnumPicker, Field } from '@/components/ui';
import { FormFooter, FormError } from '@/components/shared/form-footer';

const COMPLEJIDAD = ['baja', 'media', 'alta'] as const;
const DURACION_UNITS = ['horas', 'dias'] as const;

export function NewIdeaForm({ coupleId }: { coupleId: string }) {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [duracionVal, setDuracionVal] = useState<number | ''>('');
  const [duracionUnit, setDuracionUnit] = useState<'horas' | 'dias'>('horas');
  const [complejidad, setComplejidad] = useState<'baja' | 'media' | 'alta' | null>(null);
  const [presupuesto, setPresupuesto] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from('citas_ideas').insert({
      couple_id: coupleId,
      nombre_actividad: nombre,
      duracion: duracionVal
        ? { value: Number(duracionVal), unit: duracionUnit }
        : null,
      complejidad,
      presupuesto: presupuesto ? Number(presupuesto) : null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/citas/ideas');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Actividad">
        <Input
          required
          placeholder="Cena en La Docena"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
      </Field>

      <Field label="Duración estimada">
        <div className="flex gap-2">
          <Input
            type="number"
            min="1"
            placeholder="2"
            value={duracionVal}
            onChange={e => setDuracionVal(e.target.value === '' ? '' : Number(e.target.value))}
            className="flex-1"
          />
          <EnumPicker
            options={DURACION_UNITS}
            value={duracionUnit}
            onChange={setDuracionUnit}
          />
        </div>
      </Field>

      <Field label="Complejidad" hint="Qué tan elaborada o difícil de organizar.">
        <EnumPicker options={COMPLEJIDAD} value={complejidad} onChange={setComplejidad} />
      </Field>

      <Field label="Presupuesto aproximado (MXN)">
        <Input
          type="number"
          min="0"
          placeholder="1200"
          value={presupuesto}
          onChange={e => setPresupuesto(e.target.value === '' ? '' : Number(e.target.value))}
        />
      </Field>

      <FormError message={error} />

      <FormFooter
        loading={loading}
        submitDisabled={!nombre}
        submitLabel="Agregar a biblioteca"
      />
    </form>
  );
}
