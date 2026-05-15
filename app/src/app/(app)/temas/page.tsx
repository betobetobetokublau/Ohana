import Link from 'next/link';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { fmtDate } from '@/lib/utils/dates';
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
  acuerdo_resuelto_id: string | null;
  created_at: string;
};

const ESTADO_VARIANT: Record<Tema['estado'], 'default' | 'accent' | 'success'> = {
  abierto: 'accent',
  en_discusion: 'default',
  resuelto: 'success',
  archivado: 'default',
};

export default async function TemasPage() {
  const { supabase, couple } = await requireCoupleContext();

  const { data: temas } = await supabase
    .from('temas')
    .select('id, nombre_tema, resumen, estado, acuerdo_resuelto_id, created_at')
    .eq('couple_id', couple.id)
    .order('created_at', { ascending: false })
    .returns<Tema[]>();

  const activos = (temas ?? []).filter(t => t.estado !== 'archivado');
  const archivados = (temas ?? []).filter(t => t.estado === 'archivado');

  return (
    <div className="px-5 py-8 md:px-10 max-w-3xl mx-auto">
      <PageHeader
        eyebrow="Temas a tratar"
        title="Lo que tienen"
        titleAccent="que platicar"
        subtitle="Temas abiertos, en discusión, o resueltos en un acuerdo formal."
        actions={
          <Link href="/temas/nuevo">
            <Button variant="accent" size="sm">+ Nuevo tema</Button>
          </Link>
        }
      />

      {!activos || activos.length === 0 ? (
        <EmptyState
          title="No hay temas activos"
          description="Un tema empieza abierto, puede tener discusiones vinculadas, y se resuelve cuando crean un acuerdo."
          action={
            <Link href="/temas/nuevo">
              <Button variant="accent">Crear primer tema</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {activos.map(t => (
            <Link key={t.id} href={`/temas/${t.id}`}>
              <Card className="mt-2 hover:bg-surface-2 transition-colors">
                <div className="flex justify-between items-baseline gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[15px]">{t.nombre_tema}</div>
                    {t.resumen && (
                      <p className="meta mt-1 line-clamp-2">{t.resumen}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Pill variant={ESTADO_VARIANT[t.estado]}>{t.estado.replace('_', ' ')}</Pill>
                    <span className="meta">{fmtDate(t.created_at)}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
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
