import Link from 'next/link';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { fmtDate } from '@/lib/utils/dates';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button, Card, Pill } from '@/components/ui';

export const metadata = { title: 'Ohana · Proyectos' };
export const dynamic = 'force-dynamic';

type Proyecto = {
  id: string;
  nombre: string;
  descripcion: string | null;
  meta_ahorro: number | null;
  ahorro_actual: number;
  fecha_objetivo: string | null;
  estado: 'activo' | 'pausado' | 'completado' | 'cancelado';
};

const ESTADO_VARIANT: Record<Proyecto['estado'], 'default' | 'accent' | 'success'> = {
  activo: 'accent',
  pausado: 'default',
  completado: 'success',
  cancelado: 'default',
};

export default async function ProyectosPage() {
  const { supabase, couple } = await requireCoupleContext();

  const { data: proyectos } = await supabase
    .from('proyectos')
    .select('id, nombre, descripcion, meta_ahorro, ahorro_actual, fecha_objetivo, estado')
    .eq('couple_id', couple.id)
    .order('created_at', { ascending: false })
    .returns<Proyecto[]>();

  const activos = (proyectos ?? []).filter(p => p.estado === 'activo' || p.estado === 'pausado');
  const completados = (proyectos ?? []).filter(p => p.estado === 'completado');

  return (
    <div className="px-5 py-8 md:px-10 max-w-3xl mx-auto">
      <PageHeader
        eyebrow="Proyectos anuales"
        title="Lo que están"
        titleAccent="construyendo"
        subtitle="Multi-mes. Con meta de ahorro opcional, accionables y timeline de seguimientos."
        actions={
          <Link href="/proyectos/nuevo">
            <Button variant="accent" size="sm">+ Nuevo</Button>
          </Link>
        }
      />

      {!proyectos || proyectos.length === 0 ? (
        <EmptyState
          title="Sin proyectos en marcha"
          description="Renovación de cocina, ahorrar para un viaje grande, mudarse… cosas que tardan meses."
          action={
            <Link href="/proyectos/nuevo">
              <Button variant="accent">Crear primer proyecto</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {activos.map(p => (
              <Link key={p.id} href={`/proyectos/${p.id}`}>
                <Card className="mt-3 hover:bg-surface-2 transition-colors">
                  <div className="flex justify-between items-baseline gap-3 mb-2">
                    <div>
                      <div className="font-serif text-xl">{p.nombre}</div>
                      {p.fecha_objetivo && (
                        <div className="meta mt-0.5">Objetivo: {fmtDate(p.fecha_objetivo)}</div>
                      )}
                    </div>
                    <Pill variant={ESTADO_VARIANT[p.estado]}>{p.estado}</Pill>
                  </div>
                  {p.descripcion && (
                    <p className="meta line-clamp-2 mb-2">{p.descripcion}</p>
                  )}
                  {p.meta_ahorro && (
                    <ProgressBar current={p.ahorro_actual} target={p.meta_ahorro} />
                  )}
                </Card>
              </Link>
            ))}
          </div>

          {completados.length > 0 && (
            <section className="mt-10">
              <div className="eyebrow mb-3">Completados · {completados.length}</div>
              <div className="space-y-2">
                {completados.map(p => (
                  <Link key={p.id} href={`/proyectos/${p.id}`}>
                    <Card className="mt-2 opacity-70">
                      <div className="font-medium">{p.nombre}</div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function ProgressBar({ current, target }: { current: number; target: number }) {
  const pct = Math.min(100, (current / target) * 100);
  return (
    <div>
      <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
        <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between meta mt-1.5">
        <span>${Number(current).toLocaleString()} de ${Number(target).toLocaleString()}</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}
