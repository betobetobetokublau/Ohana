import { redirect } from 'next/navigation';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { isUserA as checkUserA, partnerOf } from '@/lib/utils/partner';
import { RatingForm } from './form';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Ohana · Calificar cita' };
export const dynamic = 'force-dynamic';

export default async function CalificarPage({ params }: { params: { id: string } }) {
  const { supabase, user, couple } = await requireCoupleContext();
  const isUserA = checkUserA(couple, user.id);

  const { data: evento } = await supabase
    .from('citas_eventos')
    .select(`
      id, fecha, lugar, calificacion_user_a, calificacion_user_b,
      idea:citas_ideas(nombre_actividad)
    `)
    .eq('id', params.id)
    .eq('couple_id', couple.id)
    .maybeSingle();

  if (!evento) redirect('/citas/eventos');

  const myRating = isUserA ? evento.calificacion_user_a : evento.calificacion_user_b;
  if (myRating) redirect('/citas/eventos'); // ya calificada

  const partnerRated = isUserA ? evento.calificacion_user_b : evento.calificacion_user_a;

  return (
    <div className="px-5 py-8 md:px-10 max-w-xl mx-auto">
      <PageHeader
        eyebrow="Calificar cita"
        title="¿Cómo"
        titleAccent="estuvo?"
        subtitle={`${(evento.idea as { nombre_actividad?: string })?.nombre_actividad ?? 'Cita'} · 1 a 5 estrellas + nota opcional.`}
      />

      <RatingForm
        eventoId={evento.id}
        isUserA={isUserA}
        partnerAlreadyRated={!!partnerRated}
      />
    </div>
  );
}
