import Link from 'next/link';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { fmtDate } from '@/lib/utils/dates';
import { PRIORIDAD_BADGE, TEMA_ESTADO_VARIANT, compareTemas, resolvePrioridad, type TemaPrioridad } from '@/lib/utils/temas';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button, Card, Pill } from '@/components/ui';

export const metadata = { title: 'Ohana · Temas' };
export const dynamic = 'force-dynamic';

type Tema = {
  id: string;
  nombre_tema: string;
  resumen: string | null;
  estado: 'abierto' | 'en_discusion' | 'resuelto' | 'archivado';
  prioridad: TemaPrioridad;
  created_at: string;
};

export default async function TemasPage() {
  const { supabase, couple } = await requireCoupleContext();

  const { data: temas } = await supabase
    .from('temas')
    .select('id, nombre_tema, resumen, estado, prioridad, created_at')
    .eq('couple_id', couple.id)
    .order('created_at', { ascending: false })
    .returns<Tema[]>();

  const temaIds = (temas ?? []).map(t => t.id);
  const linksMap = new Map<string, number>();
  const discusionesMap = new Map<string, number>();

  if (temaIds.length > 0) {
    const [{ data: links }, { data: discusiones }] = await Promise.all([
      supabase
        .from('tema_acuerdo_links')
        .select('tema_id')
        .in('tema_id', temaIds),
      supabase
        .from('discusiones')
        .select('tema_relacionado_id')
        .in('tema_relacionado_id', temaIds),
    ]);

    for (const l of links ?? []) {
      linksMap.set(l.tema_id, (linksMap.get(l.tema_id) ?? 0) + 1);
    }
    for (const d of discusiones ?? []) {
      if (d.tema_relacionado_id) {
        discusionesMap.set(d.tema_relacionado_id, (discusionesMap.get(d.tema_relacionado_id) ?? 0) + 1);
      }
    }
  }

  const activos = (temas ?? []).filter(t => t.estado !== 'archivado');
  const archivados = (temas ?? []).filter(t => t.estado === 'archivado');

  activos.sort(compareTemas);

  return (
    <div className="px-5 py-8 md:px-10 max-w-3xl mx-auto">
      <PageHeader
        eyebrow="Temas a tratar"
        title="Lo que tienen"
        titleAccent="que platicar"
        subtitle="Temas abiertos, en discusión, o resueltos en uno o más acuerdos."
        actions={
          <Link href="/temas/nuevo">
            <Button variant="accent" size="sm">+ Nuevo tema</Button>
          </Link>
        }
      />

      {!activos || activos.length === 0 ? (
        <EmptyState
          title="No hay temas activos"
          description="Un tema empieza abierto, puede tener discusiones vinculadas, y se resuelve cuando crean uno o más acuerdos."
          action={
            <Link href="/temas/nuevo">
              <Button variant="accent">Crear primer tema</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {activos.map(t => {
            const acuerdosCount = linksMap.get(t.id) ?? 0;
            const discusionesCount = discusionesMap.get(t.id) ?? 0;
            const prio = PRIORIDAD_BADGE[resolvePrioridad(t.prioridad)];
            return (
              <Link key={t.id} href={`/temas/${t.id}`}>
                <Card className="mt-2 hover:bg-surface-2 transition-colors">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span
                          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: prio.color }}
                          title={`Prioridad: ${prio.label}`}
                        />
                        <div className="font-medium text-[15px]">{t.nombre_tema}</div>
                      </div>
                      {t.resumen && (
                        <p className="text-[13px] mt-1.5 text-muted line-clamp-2">{t.resumen}</p>
                      )}
                      <div className="meta mt-2 flex items-center gap-3">
                        <span>{discusionesCount} discusion{discusionesCount === 1 ? '' : 'es'}</span>
                        <span>·</span>
                        <span>{acuerdosCount} acuerdo{acuerdosCount === 1 ? '' : 's'}</span>
                        <span>·</span>
                        <span>{fmtDate(t.created_at)}</span>
                      </div>
                    </div>
                    <Pill variant={TEMA_ESTADO_VARIANT[t.estado]}>{t.estado.replace('_', ' ')}</Pill>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {archivados.length > 0 && (
        <section className="mt-10">
          <div className="eyebrow mb-3">Archivados · {archivados.length}</div>
          <div className="space-y-2">
            {archivados.map(t => (
              <Link key={t.id} href={`/temas/${t.id}`}>
                <Card className="mt-2 opacity-60 hover:opacity-100 transition-opacity">
                  <div className="font-medium text-[14px]">{t.nombre_tema}</div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
