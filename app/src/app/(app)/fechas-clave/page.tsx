import Link from 'next/link';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { fmtDate, fmtRel, parseISO, nextAnnualOccurrence } from '@/lib/utils/dates';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button, Card } from '@/components/ui';
import { differenceInCalendarDays } from 'date-fns';

export const metadata = { title: 'Ohana · Fechas clave' };
export const dynamic = 'force-dynamic';

type FechaClave = {
  id: string;
  titulo: string;
  fecha: string;
  hora: string | null;
  descripcion: string | null;
  icono: string | null;
  recurrencia: { value: number; unit: string } | null;
};

export default async function FechasClavePage() {
  const { supabase, couple } = await requireCoupleContext();

  const { data: fechas } = await supabase
    .from('fechas_clave')
    .select('id, titulo, fecha, hora, descripcion, icono, recurrencia')
    .eq('couple_id', couple.id)
    .order('fecha', { ascending: true })
    .returns<FechaClave[]>();

  // Próxima ocurrencia: para anuales usa nextAnnualOccurrence (maneja 29 feb).
  // Para fechas únicas, mantiene la fecha original.
  const now = new Date();
  const withNextOccurrence = (fechas ?? []).map(f => {
    const nextDate = f.recurrencia?.unit === 'years'
      ? nextAnnualOccurrence(f.fecha, now)
      : parseISO(f.fecha);
    return {
      ...f,
      nextDate,
      daysAway: differenceInCalendarDays(nextDate, now),
    };
  });

  const proximas = withNextOccurrence
    .filter(f => f.daysAway >= 0)
    .sort((a, b) => a.daysAway - b.daysAway);
  const pasadas = withNextOccurrence
    .filter(f => f.daysAway < 0)
    .sort((a, b) => b.daysAway - a.daysAway);

  const masProxima = proximas[0];

  return (
    <div className="px-5 py-8 md:px-10 max-w-3xl mx-auto">
      <PageHeader
        eyebrow="Fechas clave"
        title="Lo que se"
        titleAccent="celebra"
        subtitle="Aniversarios, hitos, fechas que importan. Recordatorio 7 días antes."
        actions={
          <Link href="/fechas-clave/nueva">
            <Button variant="accent" size="sm">+ Nueva fecha</Button>
          </Link>
        }
      />

      {!fechas || fechas.length === 0 ? (
        <EmptyState
          title="Sin fechas clave registradas"
          description="Empieza con el aniversario. Después agreguen cumpleaños, hitos, primeras veces."
          action={
            <Link href="/fechas-clave/nueva">
              <Button variant="accent">Agregar primera</Button>
            </Link>
          }
        />
      ) : (
        <>
          {masProxima && (
            <section className="mb-10">
              <div className="card-warm flex justify-between items-start">
                <div>
                  <div className="eyebrow text-accent-deep">
                    Próxima · {masProxima.daysAway === 0 ? 'hoy' : `en ${masProxima.daysAway} días`}
                  </div>
                  <h2 className="display text-3xl mt-1">
                    {masProxima.titulo}
                  </h2>
                  <p className="italic-serif text-[15px] mt-1.5">
                    {fmtDate(masProxima.nextDate, "EEEE d 'de' MMMM 'de' yyyy")}
                  </p>
                </div>
                <span className="text-5xl font-serif italic text-accent">
                  {masProxima.icono ?? '★'}
                </span>
              </div>
            </section>
          )}

          {proximas.length > 1 && (
            <section className="mb-10">
              <div className="eyebrow mb-3">Próximas</div>
              <div className="space-y-2">
                {proximas.slice(1).map(f => (
                  <Card key={f.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{f.icono ?? '★'}</span>
                      <div>
                        <div className="font-medium text-[14px]">{f.titulo}</div>
                        <div className="meta">{fmtDate(f.nextDate, "EEE d MMM")}</div>
                      </div>
                    </div>
                    <span className="meta">en {f.daysAway} días</span>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {pasadas.length > 0 && (
            <section>
              <div className="eyebrow mb-3">Pasadas recientes</div>
              <div className="space-y-2">
                {pasadas.slice(0, 5).map(f => (
                  <Card key={f.id} className="flex items-center justify-between opacity-70">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{f.icono ?? '★'}</span>
                      <div>
                        <div className="font-medium text-[14px]">{f.titulo}</div>
                        <div className="meta">{fmtDate(f.nextDate)}</div>
                      </div>
                    </div>
                    <span className="meta">hace {Math.abs(f.daysAway)} días</span>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
