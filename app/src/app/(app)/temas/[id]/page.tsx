import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { fmtDate, fmtRel } from '@/lib/utils/dates';
import { TemaActions } from './actions';
import { PageHeader } from '@/components/shared/page-header';
import { Pill, Card } from '@/components/ui';
import type { TemaEstado } from '@/lib/types';

export const metadata = { title: 'Ohana · Tema' };
export const dynamic = 'force-dynamic';

const ESTADO_VARIANT: Record<TemaEstado, 'default' | 'accent' | 'success'> = {
  abierto: 'accent',
  en_discusion: 'default',
  resuelto: 'success',
  archivado: 'default',
};

export default async function TemaDetailPage({ params }: { params: { id: string } }) {
  const { supabase, couple } = await requireCoupleContext();

  const { data: tema } = await supabase
    .from('temas')
    .select('id, nombre_tema, resumen, estado, acuerdo_resuelto_id, created_at')
    .eq('id', params.id)
    .eq('couple_id', couple.id)
    .maybeSingle();

  if (!tema) redirect('/temas');

  // Discusiones vinculadas a este tema
  const { data: discusiones } = await supabase
    .from('discusiones')
    .select('id, nombre_evento, fecha, resumen, created_at')
    .eq('tema_relacionado_id', tema.id)
    .order('fecha', { ascending: false, nullsFirst: false });

  // Acuerdo resuelto (si lo hay)
  let acuerdo = null;
  if (tema.acuerdo_resuelto_id) {
    const { data } = await supabase
      .from('acuerdos')
      .select('id, nombre')
      .eq('id', tema.acuerdo_resuelto_id)
      .maybeSingle();
    acuerdo = data;
  }

  return (
    <div className="px-5 py-8 md:px-10 max-w-3xl mx-auto">
      <PageHeader
        eyebrow={`Tema · creado ${fmtDate(tema.created_at)}`}
        title={tema.nombre_tema}
        subtitle={tema.resumen ?? undefined}
        actions={<Pill variant={ESTADO_VARIANT[tema.estado as TemaEstado]}>{tema.estado.replace('_', ' ')}</Pill>}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 border border-line rounded-md overflow-hidden mb-8">
        <div className="p-4 border-r border-line">
          <div className="eyebrow text-[9px]">Estado</div>
          <div className="font-serif text-xl mt-1 capitalize">{tema.estado.replace('_', ' ')}</div>
        </div>
        <div className="p-4 border-r border-line">
          <div className="eyebrow text-[9px]">Discusiones</div>
          <div className="font-serif text-xl mt-1">{discusiones?.length ?? 0}</div>
        </div>
        <div className="p-4">
          <div className="eyebrow text-[9px]">Acuerdo</div>
          <div className="font-serif text-xl mt-1">{acuerdo ? '✓' : '—'}</div>
        </div>
      </div>

      <TemaActions
        temaId={tema.id}
        coupleId={couple.id}
        currentEstado={tema.estado as TemaEstado}
        hasAcuerdo={!!acuerdo}
        temaNombre={tema.nombre_tema}
      />

      <section className="mt-8">
        <div className="eyebrow mb-3">Discusiones vinculadas</div>
        {!discusiones || discusiones.length === 0 ? (
          <p className="italic-serif text-[14px]">
            Aún no hay discusiones vinculadas. Cuando crees una discusión y la vincules a este tema, aparecerá aquí.
          </p>
        ) : (
          <div className="space-y-2">
            {discusiones.map(d => (
              <Link key={d.id} href={`/discusiones/${d.id}`}>
                <Card className="mt-2 hover:bg-surface-2 transition-colors">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <div className="font-medium text-[14px]">{d.nombre_evento}</div>
                      {d.resumen && <p className="meta line-clamp-1 mt-0.5">{d.resumen}</p>}
                    </div>
                    <span className="meta">{d.fecha ? fmtRel(d.fecha) : fmtDate(d.created_at)}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {acuerdo && (
        <section className="mt-8">
          <div className="eyebrow mb-3">Resuelto en acuerdo</div>
          <Link href={`/acuerdos/${acuerdo.id}`}>
            <Card className="hover:bg-surface-2 transition-colors border-success border-2">
              <div className="font-medium">{acuerdo.nombre}</div>
              <div className="meta mt-1">Ver acuerdo →</div>
            </Card>
          </Link>
        </section>
      )}
    </div>
  );
}
