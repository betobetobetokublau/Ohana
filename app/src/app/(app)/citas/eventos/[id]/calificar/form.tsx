'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Textarea, Scale5, Field } from '@/components/ui';
import { FormFooter, FormError } from '@/components/shared/form-footer';

export function RatingForm({
  eventoId,
  isUserA,
  partnerAlreadyRated,
}: {
  eventoId: string;
  isUserA: boolean;
  partnerAlreadyRated: boolean;
}) {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) {
      setError('Selecciona una calificación.');
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const trimmedNotes = notes.trim() || null;

    const ratingFields = isUserA
      ? { calificacion_user_a: rating, notas_user_a: trimmedNotes }
      : { calificacion_user_b: rating, notas_user_b: trimmedNotes };

    const updateData = partnerAlreadyRated
      ? { ...ratingFields, ratings_revealed_at: new Date().toISOString() }
      : ratingFields;

    const { error } = await supabase
      .from('citas_eventos')
      .update(updateData)
      .eq('id', eventoId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/citas/eventos');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Tu calificación · 1 a 5">
        <Scale5 value={rating} onChange={setRating} />
      </Field>

      <Field label="Notas (opcional)" hint="Tu pareja las verá solo cuando ambos hayan calificado.">
        <Textarea
          rows={4}
          placeholder="Lo mejor fue cuando…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </Field>

      {partnerAlreadyRated && (
        <div className="card-warm">
          <p className="text-[13px] text-accent-deep">
            Tu pareja ya calificó. Cuando envíes la tuya, los dos verán las dos calificaciones y notas.
          </p>
        </div>
      )}

      <FormError message={error} />

      <FormFooter
        loading={loading}
        submitDisabled={!rating}
        submitLabel="Enviar calificación"
        loadingLabel="Enviando…"
      />
    </form>
  );
}
