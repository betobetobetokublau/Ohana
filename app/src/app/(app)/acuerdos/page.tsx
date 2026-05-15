import Link from 'next/link';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { fmtDate } from '@/lib/utils/dates';
import { ACUERDO_CATEGORIA_COLOR, ACUERDO_CATEGORIA_LABEL, ACUERDO_CATEGORIA_EMOJI } from '@/lib/utils/modules';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button, Card, Dot } from '@/components/ui';
import { ChevronRight } from 'lucide-react';
import type { AcuerdoCategoria } from '@/lib/types';

export const metadata = { title: 'Ohana · Acuerdos' };
export const dynamic = 'force-dynamic';

type Acuerdo = {
  id: string;
  nombre: string;
  categoria: AcuerdoCategoria | null;
  created_at: string;
};

export default async function AcuerdosPage() {
  const { supabase, couple } = await requireCoupleContext();

  const { data: acuerdos } = await supabase
    .from('acuerdos')
    .select('id, nombre, categoria, created_at')
    .eq('couple_id', couple.id)
    .order('created_at', { ascending: false })
    .returns<Acuerdo[]>();

  // Agrupar por categoría
  const byCategoria = (acuerdos ?? []).reduce<Record<string, Acuerdo[]>>((acc, a) => {
    const cat = a.categoria ?? 'otros';
    (acc[cat] ??= []).push(a);
    return acc;
  }, {});

  return (
    <div className="px-5 py-8 md:px-10 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Acuerdos"
        title="Lo que han"
        titleAccent="decidido juntos"
        subtitle="Vivos, no escritos en piedra. Puedes hacer una consulta a Claude antes de hacer algo que crees que cruza alguno."
        actions={
          <>
            <Link href="/acuerdos/nuevo">
              <Button variant="accent" size="sm">+ Nuevo acuerdo</Button>
            </Link>
            <Link href="/acuerdos/claude">
              <Button size="sm">§ Pregúntale a Claude</Button>
            </Link>
          </>
        }
      />

      {!acuerdos || acuerdos.length === 0 ? (
        <EmptyState
          title="Aún no hay acuerdos registrados"
          description="Pueden crear acuerdos desde cero o resolver un tema pendiente en un acuerdo formal."
          action={
            <Link href="/acuerdos/nuevo">
              <Button variant="accent">Crear primer acuerdo</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {(Object.keys(byCategoria) as AcuerdoCategoria[]).map(cat => (
            <section key={cat}>
              <div className="mb-3 flex items-center gap-2.5">
                <span
                  className="text-xl leading-none"
                  aria-hidden
                >{ACUERDO_CATEGORIA_EMOJI[cat]}</span>
                <h2 className="text-[15px] font-sans font-semibold uppercase tracking-[0.08em] text-ink">
                  {ACUERDO_CATEGORIA_LABEL[cat]}
                </h2>
                <span className="meta">· {byCategoria[cat]?.length}</span>
              </div>
              <div className="space-y-2">
                {byCategoria[cat]?.map(a => (
                  <Link key={a.id} href={`/acuerdos/${a.id}`}>
                    <Card className="flex items-center justify-between gap-3 hover:bg-surface-2 transition-colors mt-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[14px]">{a.nombre}</div>
                        <div className="meta mt-0.5">Creado · {fmtDate(a.created_at)}</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted flex-shrink-0" />
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
