import { redirect } from 'next/navigation';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { fmtDate, fmtRel } from '@/lib/utils/dates';
import { SeguimientoForm } from './seguimiento-form';
import { PageHeader } from '@/components/shared/page-header';
import { Card, Pill } from '@/components/ui';

export const metadata = { title: 'Ohana · Proyecto' };
export const dynamic = 'force-dynamic';

type Seguimiento = {
  id: string;
  fecha: string;
  contenido: string;
  autor: { display_name: string | null } | null;
};

export default async function ProyectoDetailPage({ params }: { params: { id: string } }) {
  const { supabase, couple, user } = await requireCoupleContext();

  const { data: proyecto } = await supabase
    .from('proyectos')
    .select('id, nombre, descripcion, meta_ahorro, ahorro_actual, fecha_objetivo, estado')
    .eq('id', params.id)
    .eq('couple_id', couple.id)
    .maybeSingle();

  if (!proyecto) redirect('/proyectos');

  const { data: seguimientos } = await supabase
    .from('proyecto_seguimientos')
    .select(`
      id, fecha, contenido,
      autor:users(display_name)
    `)
    .eq('proyecto_id', proyecto.id)
    .order('fecha', { ascending: false })
    .returns<Seguimiento[]>();

  const pct = proyecto.meta_ahorro
    ? Math.min(100, (Number(proyecto.ahorro_actual) / Number(proyecto.meta_ahorro)) * 100)
    : 0;

  return (
    <div className="px-5 py-8 md:px-10 max-w-3xl mx-auto">
      <PageHeader
        eyebrow={`Proyecto · ${proyecto.estado}`}
        title={proyecto.nombre}
        subtitle={proyecto.descripcion ?? undefined}
      />

      {/* Stats */}
      {proyecto.meta_ahorro && (
        <Card className="mb-8">
          <div className="eyebrow mb-2">Progreso de ahorro</div>
          <div className="display text-3xl mb-3">
            ${Number(proyecto.ahorro_actual).toLocaleString()}{' '}
            <span className="text-muted text-base font-sans">de</span>{' '}
            ${Number(proyecto.meta_ahorro).toLocaleString()}
          </div>
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between meta">
            <span>{pct.toFixed(0)}% completo</span>
            {proyecto.fecha_objetivo && <span>Objetivo: {fmtRel(proyecto.fecha_objetivo)}</span>}
          </div>
        </Card>
      )}

      {/* Seguimientos */}
      <section>
        <div className="eyebrow mb-3">Seguimientos · {seguimientos?.length ?? 0}</div>
        <SeguimientoForm proyectoId={proyecto.id} userId={user.id} />
        <div className="space-y-2 mt-4">
          {(seguimientos ?? []).map(s => (
            <Card key={s.id}>
              <div className="meta mb-1.5">
                {fmtDate(s.fecha)} · {s.autor?.display_name ?? '—'}
              </div>
              <p className="text-[14px] leading-relaxed whitespace-pre-line">{s.contenido}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
