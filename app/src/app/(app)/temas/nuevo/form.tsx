'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input, Textarea, Field, EnumPicker } from '@/components/ui';
import { FormFooter, FormError } from '@/components/shared/form-footer';

const PRIORIDADES = ['baja', 'media', 'alta', 'urgente'] as const;
type Prioridad = (typeof PRIORIDADES)[number];

export function NewTemaForm({ coupleId }: { coupleId: string }) {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [resumen, setResumen] = useState('');
  const [prioridad, setPrioridad] = useState<Prioridad | null>('media');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from('temas').insert({
      couple_id: coupleId,
      nombre_tema: nombre,
      resumen: resumen.trim() || null,
      prioridad: prioridad ?? 'media',
      estado: 'abierto',
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/temas');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Nombre del tema">
        <Input
          required
          placeholder="Tiempo con familias"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
      </Field>

      <Field label="Resumen (opcional)" hint="Por qué es un tema. Qué quieren resolver.">
        <Textarea
          rows={4}
          placeholder="Sigo sintiendo que vamos más a casa de mis papás. Creo que vale la pena platicarlo…"
          value={resumen}
          onChange={e => setResumen(e.target.value)}
        />
      </Field>

      <Field label="Prioridad" hint="Urgente sale arriba en la lista. Default: media.">
        <EnumPicker options={PRIORIDADES} value={prioridad} onChange={setPrioridad} />
      </Field>

      <FormError message={error} />

      <FormFooter
        loading={loading}
        submitDisabled={!nombre}
        submitLabel="Crear tema"
        loadingLabel="Creando…"
      />
    </form>
  );
}
