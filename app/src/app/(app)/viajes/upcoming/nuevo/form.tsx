'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input, Textarea, Field } from '@/components/ui';
import { FormFooter, FormError } from '@/components/shared/form-footer';

export function NewUpcomingForm({ coupleId }: { coupleId: string }) {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [presupuesto, setPresupuesto] = useState<number | ''>('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [caracteristicas, setCaracteristicas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from('viajes_eventos').insert({
      couple_id: coupleId,
      nombre,
      presupuesto: presupuesto ? Number(presupuesto) : null,
      fecha_inicio: fechaInicio || null,
      fecha_fin: fechaFin || null,
      caracteristicas: caracteristicas.trim() || null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/viajes');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Nombre del viaje">
        <Input
          required
          placeholder="Valle de Bravo · escapada de aniversario"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
      </Field>

      <Field label="Presupuesto (MXN)">
        <Input
          type="number"
          min="0"
          placeholder="8400"
          value={presupuesto}
          onChange={e => setPresupuesto(e.target.value === '' ? '' : Number(e.target.value))}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha inicio">
          <Input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
        </Field>
        <Field label="Fecha fin">
          <Input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
        </Field>
      </div>

      <Field label="Características" hint="Detalles importantes: hotel, lugares a visitar, cosas a recordar.">
        <Textarea
          rows={4}
          placeholder="Casa Airbnb con chimenea. Mesa reservada en restaurante el sábado…"
          value={caracteristicas}
          onChange={e => setCaracteristicas(e.target.value)}
        />
      </Field>

      <FormError message={error} />

      <FormFooter
        loading={loading}
        submitDisabled={!nombre}
        submitLabel="Crear viaje"
      />
    </form>
  );
}
