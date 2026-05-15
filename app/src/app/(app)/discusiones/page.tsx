import Link from 'next/link';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { fmtDate, fmtRel } from '@/lib/utils/dates';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button, Card, Pill } from '@/components/ui';

export const metadata = { title: 'Ohana · Discusiones' };
export const dynamic = 'force-dynamic';

type Discusion = {
  id: string;
  nombre_evento: string;
  fecha: string | null;
  resumen: string | null;
  tema_relacionado_id: string | null;
  created_at: string;
};

export default async function DiscusionesPage() {
  const { supabase, couple } = await requireCoupleContext();

  const { data: discusiones } = await supabase
    .from('discusiones')
    .select('id, nombre_evento, fecha, resumen, tema_relacionado_id, created_at')
    .eq('couple_id', couple.id)
    .order('fecha', { ascending: false, nullsFirst: false })
    .returns<Discusion[]>();

  return (
    <div className="px-5 py-8 md:px-10 max-w-3xl mx-auto">
      <PageHeader
        eyebrow="Discusiones"
        title="Lo que"
        titleAccent="aprendieron"
        subtitle="No es un registro de quién tuvo razón. Es un registro de qué hicieron con el desencuentro."
        actions={
          <Link href="/discusiones/nueva">
            <Button variant="accent" size="sm">+ Nueva</Button>
          </Link>
        }
      />

      {!discusiones || discusiones.length === 0 ? (
        <EmptyState
          title="Sin discusiones registradas"
          description="Registrar un desencuentro post-mortem ayuda a ver patrones. La idea no es revisitar dolor, es extraer lecciones."
          action={
            <Link href="/discusiones/nueva">
              <Button variant="accent">Registrar primera</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {discusiones.map(d => (
            <Link key={d.id} href={`/discusiones/${d.id}`}>
              <Card className="hover:bg-surface-2 transition-colors mt-2">
                <div className="flex justify-between items-baseline gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[15px]">{d.nombre_evento}</div>
                    {d.resumen && (
                      <p className="meta mt-1 line-clamp-2">{d.resumen}</p>
                    )}
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="meta">{d.fecha ? fmtRel(d.fecha) : fmtDate(d.created_at)}</span>
                    {d.tema_relacionado_id && <Pill variant="accent">vinculada</Pill>}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
