import Link from 'next/link';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { isUserA as checkUserA, partnerOf } from '@/lib/utils/partner';
import { fmtDate, fmtRel } from '@/lib/utils/dates';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button, Card } from '@/components/ui';

export const metadata = { title: 'Ohana · Historial de citas' };
export const dynamic = 'force-dynamic';

type Evento = {
  id: string;
  fecha: string | null;
  lugar: string | null;
  calificacion_user_a: number | null;
  calificacion_user_b: number | null;
  notas_user_a: string | null;
  notas_user_b: string | null;
  ratings_revealed_at: string | null;
  idea: { nombre_actividad: string } | null;
};

export default async function EventosPage() {
  const { supabase, user, couple } = await requireCoupleContext();
  const isUserA = checkUserA(couple, user.id);

  const { data: eventos } = await supabase
    .from('citas_eventos')
    .select(`
      id, fecha, lugar, calificacion_user_a, calificacion_user_b,
      notas_user_a, notas_user_b, ratings_revealed_at,
      idea:citas_ideas(nombre_actividad)
    `)
    .eq('couple_id', couple.id)
    .order('fecha', { ascending: false, nullsFirst: false })
    .returns<Evento[]>();

  return (
    <div className="px-5 py-8 md:px-10 max-w-3xl mx-auto">
      <PageHeader
        eyebrow="Historial de citas"
        title="Lo que"
        titleAccent="han hecho"
        subtitle="Cada cita con sus calificaciones duales. Las notas se revelan cuando ambos califican."
      />

      {!eventos || eventos.length === 0 ? (
        <EmptyState
          title="Aún no hay citas registradas"
          description="Cuando lleguen al consenso de una propuesta semanal, aparecerá aquí."
        />
      ) : (
        <div className="space-y-3">
          {eventos.map(ev => {
            const bothRated = ev.calificacion_user_a && ev.calificacion_user_b;
            const myRating = isUserA ? ev.calificacion_user_a : ev.calificacion_user_b;
            const partnerRating = isUserA ? ev.calificacion_user_b : ev.calificacion_user_a;
            const myNote = isUserA ? ev.notas_user_a : ev.notas_user_b;
            const partnerNote = isUserA ? ev.notas_user_b : ev.notas_user_a;

            return (
              <Card key={ev.id}>
                <div className="flex justify-between items-baseline mb-3">
                  <div>
                    <div className="eyebrow">{ev.fecha ? fmtDate(ev.fecha) : 'fecha pendiente'}</div>
                    <div className="font-serif text-xl mt-1">
                      {ev.idea?.nombre_actividad ?? 'Cita'}
                    </div>
                    {ev.lugar && <div className="meta mt-0.5">{ev.lugar}</div>}
                  </div>
                  {bothRated ? (
                    <div className="meta">
                      ★ {(((ev.calificacion_user_a ?? 0) + (ev.calificacion_user_b ?? 0)) / 2).toFixed(1)}
                    </div>
                  ) : !myRating && ev.fecha && new Date(ev.fecha) <= new Date() ? (
                    <Link href={`/citas/eventos/${ev.id}/calificar`}>
                      <Button variant="accent" size="sm">Calificar</Button>
                    </Link>
                  ) : null}
                </div>
                {bothRated && (
                  <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t border-line">
                    <div>
                      <div className="eyebrow">Tú · {myRating} de 5</div>
                      {myNote && <p className="italic-serif text-[14px] mt-1">"{myNote}"</p>}
                    </div>
                    <div>
                      <div className="eyebrow">Pareja · {partnerRating} de 5</div>
                      {partnerNote && <p className="italic-serif text-[14px] mt-1">"{partnerNote}"</p>}
                    </div>
                  </div>
                )}
                {!bothRated && myRating && (
                  <p className="meta italic">Ya calificaste. Esperando a tu pareja para revelar.</p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
