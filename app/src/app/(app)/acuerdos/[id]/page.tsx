import { redirect } from 'next/navigation';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { fmtDate, fmtRel } from '@/lib/utils/dates';
import { CommentForm } from './comment-form';
import { EditAsNewVersion } from './edit-version';
import { PageHeader } from '@/components/shared/page-header';
import { RealtimeRefresher } from '@/components/shared/realtime-refresher';
import { Card } from '@/components/ui';
import { ACUERDO_CATEGORIA_EMOJI, ACUERDO_CATEGORIA_LABEL } from '@/lib/utils/modules';
import type { AcuerdoCategoria } from '@/lib/types';

export const metadata = { title: 'Ohana · Acuerdo' };
export const dynamic = 'force-dynamic';

type Version = {
  id: string;
  version_num: number;
  nombre: string;
  descripcion: string | null;
  categoria: AcuerdoCategoria | null;
  cambios_resumen: string | null;
  created_at: string;
};

export default async function AcuerdoDetailPage({ params }: { params: { id: string } }) {
  const { supabase, couple, user } = await requireCoupleContext();

  const { data: acuerdo } = await supabase
    .from('acuerdos')
    .select(`
      id, nombre, descripcion, categoria, created_at,
      autor:users!acuerdos_creado_por_fkey(display_name)
    `)
    .eq('id', params.id)
    .eq('couple_id', couple.id)
    .maybeSingle();

  if (!acuerdo) redirect('/acuerdos');

  const [{ data: comentarios }, { data: versions }] = await Promise.all([
    supabase
      .from('acuerdo_comentarios')
      .select(`
        id, contenido, created_at,
        autor:users(display_name)
      `)
      .eq('acuerdo_id', params.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('acuerdo_versiones')
      .select('id, version_num, nombre, descripcion, categoria, cambios_resumen, created_at')
      .eq('acuerdo_id', params.id)
      .order('version_num', { ascending: true })
      .returns<Version[]>(),
  ]);

  const currentVersionNum = versions && versions.length > 0 ? versions[versions.length - 1]!.version_num : 1;

  // Construir timeline merged · comentarios + versiones, ordenados por fecha
  type TimelineEntry =
    | { kind: 'comment'; id: string; created_at: string; contenido: string; autor?: string }
    | { kind: 'version'; id: string; created_at: string; version: Version; prev?: Version };

  const timeline: TimelineEntry[] = [
    ...(comentarios ?? []).map(c => ({
      kind: 'comment' as const,
      id: c.id,
      created_at: c.created_at,
      contenido: c.contenido,
      autor: (c.autor as { display_name?: string } | null)?.display_name,
    })),
    ...(versions ?? []).map((v, i) => ({
      kind: 'version' as const,
      id: v.id,
      created_at: v.created_at,
      version: v,
      prev: i > 0 ? versions![i - 1] : undefined,
    })),
  ].sort((a, b) => a.created_at.localeCompare(b.created_at));

  const categoria = acuerdo.categoria as AcuerdoCategoria | null;

  return (
    <div className="px-5 py-8 md:px-10 max-w-2xl mx-auto">
      <RealtimeRefresher
        subs={[
          { table: 'acuerdo_comentarios', filter: `acuerdo_id=eq.${params.id}` },
          { table: 'acuerdo_versiones', filter: `acuerdo_id=eq.${params.id}` },
        ]}
      />
      <PageHeader
        eyebrow={
          categoria
            ? `${ACUERDO_CATEGORIA_EMOJI[categoria]} ${ACUERDO_CATEGORIA_LABEL[categoria]}`
            : 'Acuerdo'
        }
        title={acuerdo.nombre}
        subtitle={
          acuerdo.descripcion ??
          'Sin descripción. Pueden agregar contexto creando una nueva versión.'
        }
      />

      <div className="meta mb-6">
        Creado por {(acuerdo.autor as { display_name?: string })?.display_name ?? '—'} ·{' '}
        {fmtDate(acuerdo.created_at)} · versión {currentVersionNum}
      </div>

      <EditAsNewVersion
        acuerdoId={acuerdo.id}
        currentNombre={acuerdo.nombre}
        currentDescripcion={acuerdo.descripcion}
        currentCategoria={categoria}
      />

      <section className="mt-8">
        <div className="eyebrow mb-3">Conversación · {timeline.length}</div>

        {timeline.map(entry => {
          if (entry.kind === 'comment') {
            return (
              <Card key={`c:${entry.id}`} className="mb-2">
                <div className="meta mb-1">
                  💬 {entry.autor ?? '—'} · {fmtRel(entry.created_at)}
                </div>
                <p className="text-[14px]">{entry.contenido}</p>
              </Card>
            );
          }
          return <VersionCard key={`v:${entry.id}`} version={entry.version} prev={entry.prev} />;
        })}

        <CommentForm acuerdoId={params.id} userId={user.id} />
      </section>
    </div>
  );
}

function VersionCard({ version, prev }: { version: Version; prev?: Version }) {
  const diffs = computeDiffs(prev, version);
  return (
    <Card className="mb-2 border-accent-soft bg-bg">
      <div className="meta mb-2 text-accent-deep">
        ✎ Versión {version.version_num} · {fmtRel(version.created_at)}
        {version.cambios_resumen && ` · ${version.cambios_resumen}`}
      </div>
      {diffs.length === 0 ? (
        <p className="meta italic">Sin cambios visibles · creación inicial</p>
      ) : (
        <div className="space-y-2 text-[13px]">
          {diffs.map((d, i) => (
            <DiffRow key={i} field={d.field} before={d.before} after={d.after} />
          ))}
        </div>
      )}
    </Card>
  );
}

function DiffRow({ field, before, after }: { field: string; before: string | null; after: string | null }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase text-muted tracking-wider mb-1">{field}</div>
      {before !== null && (
        <div className="bg-error/10 border-l-2 border-error pl-2 py-1 text-[13px] line-through opacity-70 mb-1">
          {before || '(vacío)'}
        </div>
      )}
      {after !== null && (
        <div className="bg-success/10 border-l-2 border-success pl-2 py-1 text-[13px]">
          {after || '(vacío)'}
        </div>
      )}
    </div>
  );
}

function computeDiffs(prev: Version | undefined, current: Version): { field: string; before: string | null; after: string | null }[] {
  if (!prev) return []; // versión 1 · solo creación
  const diffs: { field: string; before: string | null; after: string | null }[] = [];

  if (prev.nombre !== current.nombre) {
    diffs.push({ field: 'Nombre', before: prev.nombre, after: current.nombre });
  }
  if (prev.descripcion !== current.descripcion) {
    diffs.push({ field: 'Descripción', before: prev.descripcion, after: current.descripcion });
  }
  if (prev.categoria !== current.categoria) {
    diffs.push({ field: 'Categoría', before: prev.categoria, after: current.categoria });
  }
  return diffs;
}
