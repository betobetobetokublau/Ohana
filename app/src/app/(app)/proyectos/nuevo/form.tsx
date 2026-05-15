'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input, Textarea, Field } from '@/components/ui';
import { FormFooter, FormError } from '@/components/shared/form-footer';

export function NewProyectoForm({ coupleId }: { coupleId: string }) {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [meta, setMeta] = useState<number | ''>('');
  const [fechaObjetivo, setFechaObjetivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from('proyectos').insert({
      couple_id: coupleId,
      nombre,
      descripcion: descripcion.trim() || null,
      meta_ahorro: meta ? Number(meta) : null,
      fecha_objetivo: fechaObjetivo || null,
      estado: 'activo',
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/proyectos');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Nombre">
        <Input
          required
          placeholder="Renovar cocina"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
      </Field>

      <Field label="Descripción">
        <Textarea
          rows={3}
          placeholder="Cambiar piso, alacena, isla y barra…"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
        />
      </Field>

      <Field label="Meta de ahorro (MXN, opcional)">
        <Input
          type="number"
          min="0"
          placeholder="280000"
          value={meta}
          onChange={e => setMeta(e.target.value === '' ? '' : Number(e.target.value))}
        />
      </Field>

      <Field label="Fecha objetivo">
        <Input
          type="date"
          value={fechaObjetivo}
          onChange={e => setFechaObjetivo(e.target.value)}
        />
      </Field>

      <FormError message={error} />

      <FormFooter
        loading={loading}
        submitDisabled={!nombre}
        submitLabel="Crear proyecto"
        loadingLabel="Creando…"
      />
    </form>
  );
}
