import Link from 'next/link';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { fmtDate, fmtRel } from '@/lib/utils/dates';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button, Card, Pill } from '@/components/ui';

export const metadata = { title: 'Ohana · Salud sexual' };
export const dynamic = 'force-dynamic';

type Evento = {
  id: string;
  nombre_actividad: string | null;
  tipo: 'evento' | 'salida' | null;
  fecha: string | null;
  descripcion: string | null;
};

type Revision = {
  id: string;
  proxima_fecha: string;
  tipo_revision: string | null;
  estudios_agrupados: boolean;
  usuarios_asignados: string[];
  completada: boolean;
};

export default async function SaludSexualPage() {
  const { supabase, couple } = await requireCoupleContext();

  const [{ data: eventos }, { data: revisiones }] = await Promise.all([
    supabase
      .from('saludsexual_eventos')
      .select('id, nombre_actividad, tipo, fecha, descripcion')
      .eq('couple_id', couple.id)
      .order('fecha', { ascending: false, nullsFirst: false })
      .returns<Evento[]>(),
    supabase
      .from('saludsexual_revisiones')
      .select('id, proxima_fecha, tipo_revision, estudios_agrupados, usuarios_asignados, completada')
      .eq('couple_id', couple.id)
      .order('proxima_fecha', { ascending: true })
      .returns<Revision[]>(),
  ]);

  const revisionesPendientes = (revisiones ?? []).filter(r => !r.completada);

  return (
    <div className="px-5 py-8 md:px-10 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Salud sexual · privado · encriptado"
        title="Salud y"
        titleAccent="registro"
        subtitle="Eventos íntimos (en casa) y salidas (fuera). Revisiones médicas programadas con recordatorio."
        actions={
          <>
            <Link href="/salud-sexual/evento/nuevo">
              <Button variant="accent" size="sm">+ Evento</Button>
            </Link>
            <Link href="/salud-sexual/revision/nueva">
              <Button variant="ghost" size="sm">+ Revisión</Button>
            </Link>
          </>
        }
      />

      {/* Revisiones próximas · destacadas */}
      {revisionesPendientes.length > 0 && (
        <section className="mb-10">
          <div className="eyebrow mb-3">Revisiones próximas · {revisionesPendientes.length}</div>
          <div className="space-y-2">
            {revisionesPendientes.map(r => (
              <Card key={r.id} className="card-warm">
                <div className="flex justify-between items-baseline">
                  <div>
                    <div className="font-medium text-[15px]">{r.tipo_revision ?? 'Revisión'}</div>
                    <div className="meta mt-1">
                      {fmtDate(r.proxima_fecha)}
                      {r.estudios_agrupados && ' · estudios agrupados'}
                    </div>
                  </div>
                  <Pill variant="accent">{fmtRel(r.proxima_fecha)}</Pill>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Eventos */}
      <section>
        <div className="eyebrow mb-3">Eventos · {eventos?.length ?? 0}</div>
        {!eventos || eventos.length === 0 ? (
          <EmptyState
            title="Sin eventos registrados"
            description="Una bitácora privada entre los dos. Las notas y comentarios viven encriptados."
          />
        ) : (
          <div className="space-y-2">
            {eventos.map(e => (
              <Card key={e.id}>
                <div className="flex justify-between items-baseline gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[14px]">
                      {e.nombre_actividad ?? 'Evento'}
                    </div>
                    {e.descripcion && (
                      <p className="meta mt-1 line-clamp-2">{e.descripcion}</p>
                    )}
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    {e.tipo && <Pill>{e.tipo}</Pill>}
                    {e.fecha && <span className="meta">{fmtRel(e.fecha)}</span>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
