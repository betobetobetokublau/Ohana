'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, Pill } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { detectConsensus } from '@/lib/utils/citas';

type Idea = {
  id: string;
  nombre_actividad: string;
  duracion: { value: number; unit: string } | null;
  complejidad: string | null;
  presupuesto: number | null;
};

interface VotingFlowProps {
  propuestaId: string;
  coupleId: string;
  isUserA: boolean;
  ideas: Idea[];
  ideaIds: string[];
  rationales: string[];
  myVotes: string[];
  partnerVotes: string[];
  consensoId: string | null;
}

export function VotingFlow({
  propuestaId,
  coupleId,
  isUserA,
  ideas,
  ideaIds,
  rationales,
  myVotes,
  partnerVotes,
  consensoId,
}: VotingFlowProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(myVotes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const haveIvoted = myVotes.length > 0;
  const partnerVoted = partnerVotes.length > 0;
  const bothVoted = haveIvoted && partnerVoted;

  function toggleVote(ideaId: string) {
    if (haveIvoted) return; // ya votó, no editable después de enviar
    setSelected(prev => {
      if (prev.includes(ideaId)) return prev.filter(x => x !== ideaId);
      if (prev.length >= 2) return prev;
      return [...prev, ideaId];
    });
  }

  async function submitVotes() {
    if (selected.length !== 2) {
      setError('Selecciona exactamente 2 ideas.');
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const consensoIdeaId = detectConsensus(selected, partnerVotes);

    const baseUpdate = isUserA
      ? { votos_user_a: selected }
      : { votos_user_b: selected };

    const updateData = consensoIdeaId
      ? {
          ...baseUpdate,
          consenso_idea_id: consensoIdeaId,
          resolved_at: new Date().toISOString(),
        }
      : baseUpdate;

    const { error } = await supabase
      .from('citas_propuestas')
      .update(updateData)
      .eq('id', propuestaId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  // Find consensus idea
  const consensusIdea = consensoId ? ideas.find(i => i.id === consensoId) : null;

  return (
    <div className="space-y-4">
      {ideaIds.map((ideaId, idx) => {
        const idea = ideas.find(i => i.id === ideaId);
        if (!idea) return null;
        const rationale = rationales[idx] ?? '';
        const isPicked = selected.includes(ideaId);
        const inOverlap = bothVoted && myVotes.includes(ideaId) && partnerVotes.includes(ideaId);
        const isLocked = haveIvoted;

        return (
          <button
            key={ideaId}
            type="button"
            onClick={() => toggleVote(ideaId)}
            disabled={isLocked}
            className={cn(
              'w-full text-left p-5 rounded-md border transition-colors relative',
              isPicked
                ? 'bg-bg border-ink border-2'
                : 'bg-surface border-line hover:border-line-2',
              isLocked && 'cursor-default'
            )}
          >
            {isPicked && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-ink text-bg flex items-center justify-center text-xs font-bold">
                ✓
              </div>
            )}
            <div className="font-serif text-xl mb-1">{idea.nombre_actividad}</div>
            <p className="italic-serif text-[13px] mb-3">{rationale}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {idea.duracion && (
                <Pill>
                  {idea.duracion.value} {idea.duracion.unit}
                </Pill>
              )}
              {idea.complejidad && <Pill>{idea.complejidad}</Pill>}
              {idea.presupuesto && <Pill>${idea.presupuesto.toLocaleString()}</Pill>}
            </div>
            {bothVoted && (
              <div className="flex gap-3 pt-3 border-t border-line text-[12px]">
                <span className={cn('meta', myVotes.includes(ideaId) && 'text-accent font-semibold')}>
                  Tú: {myVotes.includes(ideaId) ? '✓' : '—'}
                </span>
                <span className={cn('meta', partnerVotes.includes(ideaId) && 'text-accent font-semibold')}>
                  Pareja: {partnerVotes.includes(ideaId) ? '✓' : '—'}
                </span>
                {inOverlap && <Pill variant="accent">Overlap</Pill>}
              </div>
            )}
          </button>
        );
      })}

      {error && <p className="text-[13px] text-error font-medium">{error}</p>}

      {!haveIvoted && (
        <div className="pt-4">
          <Button
            variant="accent"
            className="w-full py-3.5"
            disabled={selected.length !== 2 || loading}
            onClick={submitVotes}
          >
            {loading ? 'Enviando…' : `Enviar mis 2 votos`}
          </Button>
          <p className="meta text-center mt-3">
            {partnerVoted
              ? 'Tu pareja ya votó. Tu envío revela el resultado.'
              : 'Tu pareja aún no vota. Verás su selección cuando ambos hayan votado.'}
          </p>
        </div>
      )}

      {consensusIdea && (
        <Card className="mt-6 text-center border-2 border-accent bg-bg p-7">
          <div className="eyebrow text-accent mb-1">Consenso alcanzado</div>
          <div className="display text-2xl">{consensusIdea.nombre_actividad}</div>
          <p className="italic-serif text-[14px] mt-2 mb-4">
            Ambos votaron por esta. Es la cita oficial de la semana.
          </p>
          <Button
            variant="primary"
            onClick={async () => {
              const supabase = createClient();
              await supabase.from('citas_eventos').insert({
                couple_id: coupleId,
                idea_id: consensusIdea.id,
              });
              router.push('/citas/eventos');
            }}
          >
            Confirmar fecha
          </Button>
        </Card>
      )}

      {bothVoted && !consensoId && (
        <Card className="mt-6 text-center p-6">
          <div className="eyebrow">Sin coincidencia</div>
          <p className="italic-serif text-[14px] mt-2 mb-4">
            Los dos votaron pero no eligieron ninguna en común. Pueden regenerar la propuesta.
          </p>
          <Button variant="ghost" onClick={() => router.push('/citas/votar/nueva')}>
            Crear otra propuesta
          </Button>
        </Card>
      )}
    </div>
  );
}
