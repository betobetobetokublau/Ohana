import Link from 'next/link';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { fmtWeekOf, fmtRel } from '@/lib/utils/dates';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button, Card, Pill } from '@/components/ui';
import { isUserA } from '@/lib/utils/partner';

export const metadata = { title: 'Ohana · Citas' };
export const dynamic = 'force-dynamic';

export default async function CitasPage() {
  const { supabase, user, couple } = await requireCoupleContext();
  const weekOf = fmtWeekOf();

  // Propuesta de esta semana (si existe)
  const { data: propuesta } = await supabase
    .from('citas_propuestas')
    .select('id, idea_ids, rationales, votos_user_a, votos_user_b, consenso_idea_id')
    .eq('couple_id', couple.id)
    .eq('semana', weekOf)
    .maybeSingle();

  // Conteo de ideas + última cita
  const [{ count: ideasCount }, { data: ultimaCita }] = await Promise.all([
    supabase
      .from('citas_ideas')
      .select('id', { count: 'exact', head: true })
      .eq('couple_id', couple.id)
      .eq('archivada', false),
    supabase
      .from('citas_eventos')
      .select('id, fecha, idea_id, calificacion_user_a, calificacion_user_b')
      .eq('couple_id', couple.id)
      .order('fecha', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const userIsA = isUserA(couple, user.id);
  const myVotes = userIsA ? propuesta?.votos_user_a : propuesta?.votos_user_b;
  const partnerVotes = userIsA ? propuesta?.votos_user_b : propuesta?.votos_user_a;

  return (
    <div className="px-5 py-8 md:px-10 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Citas en pareja"
        title="Lo que hacen"
        titleAccent="juntos"
        subtitle="Una cita por semana. Biblioteca compartida. Calificaciones de ambos."
        actions={
          <>
            <Link href="/citas/ideas/nueva">
              <Button variant="accent" size="sm">+ Nueva idea</Button>
            </Link>
            <Link href="/citas/eventos">
              <Button variant="ghost" size="sm">Historial</Button>
            </Link>
          </>
        }
      />

      {/* Propuesta de la semana */}
      <section className="mb-10">
        <div className="eyebrow mb-3">Esta semana</div>
        {propuesta ? (
          <WeekProposalCard
            propuestaId={propuesta.id}
            consenso={!!propuesta.consenso_idea_id}
            myVotes={myVotes ?? []}
            partnerVotes={partnerVotes ?? []}
          />
        ) : (
          <EmptyState
            title="Sin propuesta esta semana"
            description="En Phase 4 Claude genera 3 propuestas automáticamente cada lunes. Mientras tanto, puedes crear una manualmente desde tu biblioteca."
            action={
              <Link href="/citas/votar/nueva">
                <Button variant="accent">Crear propuesta manual</Button>
              </Link>
            }
          />
        )}
      </section>

      {/* Quick stats */}
      <section>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/citas/ideas" className="block">
            <Card className="hover:bg-surface-2 transition-colors">
              <div className="eyebrow">Biblioteca</div>
              <div className="display text-3xl mt-1">{ideasCount ?? 0}</div>
              <div className="meta mt-1">ideas activas</div>
            </Card>
          </Link>
          <Link href="/citas/eventos" className="block">
            <Card className="hover:bg-surface-2 transition-colors">
              <div className="eyebrow">Última cita</div>
              <div className="font-serif text-xl mt-1">
                {ultimaCita?.fecha ? fmtRel(ultimaCita.fecha) : '—'}
              </div>
              {ultimaCita?.calificacion_user_a && ultimaCita?.calificacion_user_b && (
                <div className="meta mt-1">
                  ★ {((ultimaCita.calificacion_user_a + ultimaCita.calificacion_user_b) / 2).toFixed(1)} promedio
                </div>
              )}
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}

function WeekProposalCard({
  propuestaId,
  consenso,
  myVotes,
  partnerVotes,
}: {
  propuestaId: string;
  consenso: boolean;
  myVotes: string[];
  partnerVotes: string[];
}) {
  const haveIvoted = myVotes.length > 0;
  const partnerVoted = partnerVotes.length > 0;

  return (
    <Card className="card-warm">
      <div className="flex justify-between items-baseline mb-3">
        <div className="eyebrow text-accent-deep">3 propuestas</div>
        {consenso && <Pill variant="success">Consenso alcanzado</Pill>}
      </div>
      <p className="font-serif italic text-[16px] text-ink mb-4">
        {consenso
          ? 'Ya hay overlap. La cita queda confirmada.'
          : haveIvoted && partnerVoted
            ? 'Los dos votaron pero sin coincidencia. ¿Regenerar?'
            : haveIvoted
              ? 'Tu voto está. Falta tu pareja.'
              : partnerVoted
                ? 'Tu pareja ya votó. Tu turno.'
                : 'Ninguno ha votado. Empiezan los dos.'}
      </p>
      <Link href={`/citas/votar?propuesta=${propuestaId}`}>
        <Button variant="accent" size="sm">
          {haveIvoted ? 'Ver propuesta' : 'Votar ahora'}
        </Button>
      </Link>
    </Card>
  );
}
