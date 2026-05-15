import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { fmtDate, fmtRel } from '@/lib/utils/dates';
import { TemaActions } from './actions';
import { PageHeader } from '@/components/shared/page-header';
import { Pill, Card } from '@/components/ui';
import type { TemaEstado, AcuerdoCategoria } from '@/lib/types';
import { ACUERDO_CATEGORIA_LABEL } from '@/lib/utils/modules';
import { PRIORIDAD_BADGE, TEMA_ESTADO_VARIANT, resolvePrioridad } from '@/lib/utils/temas';

export const metadata = { title: 'Ohana · Tema' };
export const dynamic = 'force-dynamic';

export default async function TemaDetailPage({ params }: { params: { id: string } }) {
  const { supabase, couple } = await requireCoupleContext();

  const { data: tema } = await supabase
    .from('temas')
    .select('id, nombre_tema, resumen, estado, prioridad, created_at')
    .eq('id', params.id)
    .eq('couple_id', couple.id)
    .maybeSingle();

  if (!tema) redirect('/temas');

  // Discusiones vinculadas
  const { data: discusiones } = await supabase
    .from('discusiones')
    .select('id, nombre_evento, fecha, resumen, created_at')
    .eq('tema_relacionado_id', tema.id)
    .order('fecha', { ascending: false, nullsFirst: false });

  // Acuerdos vinculados (M:M)
  const { data: links } = await supabase
    .from('tema_acuerdo_links')
    .select('acuerdo:acuerdos(id, nombre, categoria)')
    .eq('tema_id', tema.id);

  type AcuerdoLink = { acuerdo: { id: string; nombre: string; categoria: AcuerdoCategoria | null } | null };
  const acuerdos = (links as AcuerdoLink[] | null ?? [])
    .map(l => l.acuerdo)
    .filter((a): a is { id: string; nombre: string; categoria: AcuerdoCategoria | null } => !!a);

  // Otros acuerdos del couple para sugerirlos en el link picker
  const linkedIds = acuerdos.map(a => a.id);
  const { data: otrosAcuerdos } = await supabase
    .from('acuerdos')
    .select('id, nombre, categoria')
    .eq('couple_id', couple.id)
    .order('created_at', { ascending: false });
  const availableToLink = (otrosAcuerdos ?? []).filter(a => !linkedIds.includes(a.id));

  const prio = PRIORIDAD_BADGE[resolvePrioridad(tema.prioridad)];

  return (
    <div className="px-5 py-8 md:px-10 max-w-3xl mx-auto">
      <PageHeader
        eyebrow={`Tema · creado ${fmtDate(tema.created_at)}`}
        title={tema.nombre_tema}
        subtitle={tema.resumen ?? undefined}
        actions={
          <div className="flex gap-2 items-center">
            <Pill style={{ backgroundColor: `${prio.color}30`, color: prio.color }}>
              ● {prio.label}
            </Pill>
            <Pill variant={TEMA_ESTADO_VARIANT[tema.estado as TemaEstado]}>
              {tema.estado.replace('_', ' ')}
            </Pill>
          </div>
        }
      />

      {/* Stats + always-on add buttons */}
      <div className="grid grid-cols-3 border border-line rounded-md overflow-hidden mb-3">
        <StatCell label="Discusiones" value={discusiones?.length ?? 0} />
        <StatCell label="Acuerdos" value={acuerdos.length} />
        <StatCell label="Estado" value={tema.estado.replace('_', ' ')} small />
      </div>
      <div className="flex gap-3 mb-8 text-[13px]">
        <Link href={`/discusiones/nueva?tema=${tema.id}`} className="text-accent underline underline-offset-2 hover:text-accent-deep">
          + Agregar discusión a este tema
        </Link>
        <span className="text-muted">·</span>
        <span className="text-accent underline underline-offset-2 hover:text-accent-deep cursor-pointer" data-action="add-acuerdo">
          + Vincular o crear acuerdo
        </span>
      </div>

      <TemaActions
        temaId={tema.id}
        coupleId={couple.id}
        currentEstado={tema.estado as TemaEstado}
        temaNombre={tema.nombre_tema}
        availableAcuerdos={availableToLink as { id: string; nombre: string; categoria: AcuerdoCategoria | null }[]}
      />

      {/* Discusiones */}
      <section className="mt-8">
        <div className="eyebrow mb-3">Discusiones vinculadas</div>
        {!discusiones || discusiones.length === 0 ? (
          <p className="italic-serif text-[14px]">
            Aún no hay discusiones vinculadas. Click en "+ Agregar discusión" arriba.
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

      {/* Acuerdos vinculados */}
      {acuerdos.length > 0 && (
        <section className="mt-8">
          <div className="eyebrow mb-3">Acuerdos relacionados · {acuerdos.length}</div>
          <div className="space-y-2">
            {acuerdos.map(a => (
              <Link key={a.id} href={`/acuerdos/${a.id}`}>
                <Card className="hover:bg-surface-2 transition-colors border-success/40">
                  <div className="font-medium text-[14px]">{a.nombre}</div>
                  {a.categoria && (
                    <div className="meta mt-1">{ACUERDO_CATEGORIA_LABEL[a.categoria]}</div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCell({ label, value, small }: { label: string; value: string | number; small?: boolean }) {
  return (
    <div className="p-4 border-r border-line last:border-r-0">
      <div className="eyebrow text-[9px]">{label}</div>
      <div className={`font-serif mt-1 ${small ? 'text-base capitalize' : 'text-2xl'}`}>{value}</div>
    </div>
  );
}
