'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input, Textarea, EnumPicker, Field } from '@/components/ui';
import { FormFooter, FormError } from '@/components/shared/form-footer';
import { ACUERDO_CATEGORIA_LABEL } from '@/lib/utils/modules';
import type { AcuerdoCategoria } from '@/lib/types';

const CATEGORIAS: readonly AcuerdoCategoria[] = [
  'comunicacion', 'dinero', 'familia', 'tiempo', 'intimidad', 'hogar', 'otros',
];

export function NewAcuerdoForm({ coupleId, userId }: { coupleId: string; userId: string }) {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState<AcuerdoCategoria | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !categoria) {
      setError('Llena nombre y categoría.');
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from('acuerdos').insert({
      couple_id: coupleId,
      creado_por: userId,
      nombre,
      descripcion: descripcion.trim() || null,
      categoria,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/acuerdos');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Nombre del acuerdo">
        <Input
          required
          placeholder="No discutir antes de dormir"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
      </Field>

      <Field label="Descripción (opcional)" hint="El contexto y los detalles del acuerdo.">
        <Textarea
          rows={4}
          placeholder="Si surge algo después de las 10 PM, lo platicamos al día siguiente con calma…"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
        />
      </Field>

      <Field label="Categoría">
        <EnumPicker
          options={CATEGORIAS}
          value={categoria}
          onChange={setCategoria}
          labelMap={ACUERDO_CATEGORIA_LABEL}
        />
      </Field>

      <FormError message={error} />

      <FormFooter
        loading={loading}
        submitDisabled={!nombre || !categoria}
        submitLabel="Crear acuerdo"
      />
    </form>
  );
}
