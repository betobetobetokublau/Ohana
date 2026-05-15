'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input, Textarea, Field } from '@/components/ui';
import { FormFooter, FormError } from '@/components/shared/form-footer';
import { cn } from '@/lib/utils/cn';
import type { MimoEmocion } from '@/lib/types';

const EMOCIONES: { key: MimoEmocion; label: string; emoji: string }[] = [
  { key: 'gratitud',    label: 'Gratitud',    emoji: '🙏' },
  { key: 'ternura',     label: 'Ternura',     emoji: '🥹' },
  { key: 'admiracion',  label: 'Admiración',  emoji: '✨' },
  { key: 'orgullo',     label: 'Orgullo',     emoji: '🏆' },
  { key: 'diversion',   label: 'Diversión',   emoji: '😄' },
  { key: 'deseo',       label: 'Deseo',       emoji: '🔥' },
  { key: 'paz',         label: 'Paz',         emoji: '🌿' },
];

export function NewMimoForm({
  coupleId,
  userId,
  destinatarioId,
}: {
  coupleId: string;
  userId: string;
  destinatarioId: string;
}) {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [emocion, setEmocion] = useState<MimoEmocion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo) {
      setError('Pon al menos un título.');
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from('mimos').insert({
      couple_id: coupleId,
      autor_id: userId,
      destinatario_id: destinatarioId,
      titulo,
      descripcion: descripcion.trim() || null,
      emocion_asociada: emocion,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/mimos');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Título">
        <Input
          required
          placeholder="El café del miércoles, sin que lo pidiera"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
        />
      </Field>

      <Field label="Cuéntalo" hint="Tan corto o detallado como quieras.">
        <Textarea
          rows={5}
          placeholder="Estabas concentrado escribiendo y simplemente apareció en la mesa…"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
        />
      </Field>

      <Field label="¿Qué emoción?">
        <div className="grid grid-cols-4 gap-2">
          {EMOCIONES.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setEmocion(opt.key)}
              className={cn(
                'aspect-square rounded-md border-2 flex flex-col items-center justify-center gap-1 transition-colors',
                emocion === opt.key
                  ? 'border-accent bg-accent-soft'
                  : 'border-line bg-bg hover:border-line-2'
              )}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-[10px] font-medium text-muted">{opt.label}</span>
            </button>
          ))}
        </div>
      </Field>

      <FormError message={error} />

      <FormFooter
        loading={loading}
        submitDisabled={!titulo}
        submitLabel="Guardar mimo"
      />

      <p className="meta text-center">
        Privado hasta la sesión mensual. Tu pareja solo verá el número, no el contenido.
      </p>
    </form>
  );
}
