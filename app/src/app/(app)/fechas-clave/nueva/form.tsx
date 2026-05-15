'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input, Textarea, Field } from '@/components/ui';
import { FormFooter, FormError } from '@/components/shared/form-footer';
import { cn } from '@/lib/utils/cn';

const ICONOS = ['★', '🎂', '💍', '✈', '🏠', '❤', '🌹', '🎓', '🎁'];

export function NewFechaForm({ coupleId }: { coupleId: string }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [icono, setIcono] = useState<string>('★');
  const [anual, setAnual] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo || !fecha) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from('fechas_clave').insert({
      couple_id: coupleId,
      titulo,
      fecha,
      descripcion: descripcion.trim() || null,
      icono,
      recurrencia: anual ? { value: 1, unit: 'years' } : null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/fechas-clave');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Título">
        <Input
          required
          placeholder="Aniversario · 4 años"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
        />
      </Field>

      <Field label="Fecha">
        <Input
          type="date"
          required
          value={fecha}
          onChange={e => setFecha(e.target.value)}
        />
      </Field>

      <Field label="Descripción (opcional)">
        <Textarea
          rows={2}
          placeholder="Primer aniversario después de vivir juntos…"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
        />
      </Field>

      <Field label="Icono">
        <div className="grid grid-cols-9 gap-2">
          {ICONOS.map(i => (
            <button
              key={i}
              type="button"
              onClick={() => setIcono(i)}
              className={cn(
                'aspect-square rounded-sm border-2 text-2xl transition-colors',
                icono === i ? 'border-accent bg-accent-soft' : 'border-line bg-bg hover:border-line-2'
              )}
            >
              {i}
            </button>
          ))}
        </div>
      </Field>

      <Field label="¿Es anual?" hint="La mayoría de aniversarios y cumpleaños sí. Hitos únicos no.">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAnual(true)}
            className={`flex-1 py-3 rounded-sm border text-[13px] font-semibold uppercase tracking-wider ${
              anual ? 'bg-ink text-bg border-ink' : 'bg-surface border-line'
            }`}
          >
            Anual
          </button>
          <button
            type="button"
            onClick={() => setAnual(false)}
            className={`flex-1 py-3 rounded-sm border text-[13px] font-semibold uppercase tracking-wider ${
              !anual ? 'bg-ink text-bg border-ink' : 'bg-surface border-line'
            }`}
          >
            Único
          </button>
        </div>
      </Field>

      <FormError message={error} />

      <FormFooter
        loading={loading}
        submitDisabled={!titulo || !fecha}
        submitLabel="Agregar fecha"
      />
    </form>
  );
}
