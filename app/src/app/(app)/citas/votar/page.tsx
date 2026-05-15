import { redirect } from 'next/navigation';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { isUserA as checkUserA, partnerOf } from '@/lib/utils/partner';
import { VotingFlow } from './voting-flow';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui';
import Link from 'next/link';

export const metadata = { title: 'Ohana · Votar cita' };
export const dynamic = 'force-dynamic';

export default async function VotarPage({
  searchParams,
}: {
  searchParams: { propuesta?: string };
}) {
  const { supabase, user, couple } = await requireCoupleContext();

  if (!searchParams.propuesta) redirect('/citas');

  const { data: propuesta } = await supabase
    .from('citas_propuestas')
    .select('id, idea_ids, rationales, votos_user_a, votos_user_b, consenso_idea_id, semana')
    .eq('id', searchParams.propuesta)
    .eq('couple_id', couple.id)
    .maybeSingle();

  if (!propuesta) {
    return (
      <div className="px-5 py-8 md:px-10 max-w-xl mx-auto">
        <EmptyState
          title="Propuesta no encontrada"
          action={<Link href="/citas"><Button>Volver a Citas</Button></Link>}
        />
      </div>
    );
  }

  // Cargar ideas referenciadas
  type IdeaRow = {
    id: string;
    nombre_actividad: string;
    duracion: { value: number; unit: string } | null;
    complejidad: string | null;
    presupuesto: number | null;
  };
  const { data: ideas } = await supabase
    .from('citas_ideas')
    .select('id, nombre_actividad, duracion, complejidad, presupuesto')
    .in('id', propuesta.idea_ids)
    .returns<IdeaRow[]>();

  const isUserA = checkUserA(couple, user.id);
  const myVotes = (isUserA ? propuesta.votos_user_a : propuesta.votos_user_b) ?? [];
  const partnerVotes = (isUserA ? propuesta.votos_user_b : propuesta.votos_user_a) ?? [];

  return (
    <div className="px-5 py-8 md:px-10 max-w-3xl mx-auto">
      <PageHeader
        eyebrow={`Votación · semana ${propuesta.semana}`}
        title="Pick 2"
        titleAccent="de 3"
        subtitle="Marca las que te emocionen. Verás los votos de tu pareja cuando ambos terminen."
      />

      <VotingFlow
        propuestaId={propuesta.id}
        coupleId={couple.id}
        isUserA={isUserA}
        ideas={ideas ?? []}
        ideaIds={propuesta.idea_ids}
        rationales={propuesta.rationales}
        myVotes={myVotes}
        partnerVotes={partnerVotes}
        consensoId={propuesta.consenso_idea_id}
      />
    </div>
  );
}
