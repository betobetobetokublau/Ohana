import { redirect } from 'next/navigation';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { fmtDate, fmtRel } from '@/lib/utils/dates';
import { CommentForm } from './comment-form';
import { PageHeader } from '@/components/shared/page-header';
import { RealtimeRefresher } from '@/components/shared/realtime-refresher';
import { Card } from '@/components/ui';

export const metadata = { title: 'Ohana · Acuerdo' };
export const dynamic = 'force-dynamic';

export default async function AcuerdoDetailPage({ params }: { params: { id: string } }) {
  const { supabase, couple, user } = await requireCoupleContext();

  const { data: acuerdo } = await supabase
    .from('acuerdos')
    .select(`
      id, nombre, descripcion, categoria, created_at,
      autor:users!acuerdos_creado_por_fkey(display_name)
    `)
    .eq('id', params.id)
    .eq('couple_id', couple.id)
    .maybeSingle();

  if (!acuerdo) redirect('/acuerdos');

  const { data: comentarios } = await supabase
    .from('acuerdo_comentarios')
    .select(`
      id, contenido, created_at,
      autor:users(display_name)
    `)
    .eq('acuerdo_id', params.id)
    .order('created_at', { ascending: true });

  return (
    <div className="px-5 py-8 md:px-10 max-w-2xl mx-auto">
      <RealtimeRefresher
        subs={[{ table: 'acuerdo_comentarios', filter: `acuerdo_id=eq.${params.id}` }]}
      />
      <PageHeader
        eyebrow={`Categoría: ${acuerdo.categoria ?? '—'}`}
        title={acuerdo.nombre}
        subtitle={
          acuerdo.descripcion ??
          'Sin descripción. Pueden editar este acuerdo para agregar contexto.'
        }
      />

      <div className="meta mb-6">
        Creado por {(acuerdo.autor as { display_name?: string })?.display_name ?? '—'} ·{' '}
        {fmtDate(acuerdo.created_at)}
      </div>

      <section>
        <div className="eyebrow mb-3">Conversación · {comentarios?.length ?? 0}</div>

        {(comentarios ?? []).map(c => (
          <Card key={c.id} className="mb-2">
            <div className="meta mb-1">
              {(c.autor as { display_name?: string } | null)?.display_name ?? '—'} · {fmtRel(c.created_at)}
            </div>
            <p className="text-[14px]">{c.contenido}</p>
          </Card>
        ))}

        <CommentForm acuerdoId={params.id} userId={user.id} />
      </section>
    </div>
  );
}
