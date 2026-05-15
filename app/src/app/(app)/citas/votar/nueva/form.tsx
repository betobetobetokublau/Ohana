'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { fmtWeekOf } from '@/lib/utils/dates';
import { Field } from '@/components/ui';
import { FormFooter, FormError } from '@/components/shared/form-footer';
import { cn } from '@/lib/utils/cn';

export function ManualProposalForm({
  coupleId,
  ideas,
}: {
  coupleId: string;
  ideas: { id: string; nombre_actividad: string }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleIdea(id: string) {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.length !== 3) {
      setError('Selecciona exactamente 3 ideas.');
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from('citas_propuestas').insert({
      couple_id: coupleId,
      semana: fmtWeekOf(),
      idea_ids: selected,
      rationales: ['Selección manual.', 'Selección manual.', 'Selección manual.'],
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/citas');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label={`Selecciona 3 ideas · ${selected.length}/3`}>
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {ideas.map(idea => {
            const isSelected = selected.includes(idea.id);
            const disabled = !isSelected && selected.length >= 3;
            return (
              <button
                key={idea.id}
                type="button"
                onClick={() => toggleIdea(idea.id)}
                disabled={disabled}
                className={cn(
                  'w-full text-left p-3 rounded-md border transition-colors',
                  isSelected
                    ? 'bg-bg border-ink border-2 font-semibold'
                    : disabled
                      ? 'bg-surface border-line opacity-40'
                      : 'bg-surface border-line hover:border-line-2'
                )}
              >
                {idea.nombre_actividad}
              </button>
            );
          })}
        </div>
      </Field>

      <FormError message={error} />

      <FormFooter
        loading={loading}
        submitDisabled={selected.length !== 3}
        submitLabel="Crear propuesta"
        loadingLabel="Creando…"
      />
    </form>
  );
}
