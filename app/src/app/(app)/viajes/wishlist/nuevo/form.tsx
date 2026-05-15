'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input, Textarea, EnumPicker, Scale5, Field } from '@/components/ui';
import { FormFooter, FormError } from '@/components/shared/form-footer';

const TIPOS = ['viaje', 'evento'] as const;

export function NewWishForm({
  coupleId,
  userId,
  isUserA,
}: {
  coupleId: string;
  userId: string;
  isUserA: boolean;
}) {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<typeof TIPOS[number] | null>('viaje');
  const [interes, setInteres] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !interes) {
      setError('Falta nombre o interés.');
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const insertData: {
      couple_id: string;
      agregado_por: string;
      nombre: string;
      descripcion: string | null;
      tipo: typeof TIPOS[number] | null;
      interes_user_a?: number;
      interes_user_b?: number;
    } = {
      couple_id: coupleId,
      agregado_por: userId,
      nombre,
      descripcion: descripcion.trim() || null,
      tipo,
    };
    if (isUserA) insertData.interes_user_a = interes;
    else insertData.interes_user_b = interes;

    const { error } = await supabase.from('viajes_wishlist').insert(insertData);

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
      <Field label="Lugar / Evento">
        <Input
          required
          placeholder="Oaxaca"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
      </Field>

      <Field label="Descripción">
        <Textarea
          rows={3}
          placeholder="Comida, mezcal, taller de barro negro. Hotel boutique en el centro."
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
        />
      </Field>

      <Field label="Tipo">
        <EnumPicker options={TIPOS} value={tipo} onChange={setTipo} />
      </Field>

      <Field label="Tu nivel de interés · 1 a 5" hint="Tu pareja califica el suyo cuando lo vea.">
        <Scale5 value={interes} onChange={setInteres} />
      </Field>

      <FormError message={error} />

      <FormFooter
        loading={loading}
        submitDisabled={!nombre || !interes}
        submitLabel="Agregar a wishlist"
      />
    </form>
  );
}
