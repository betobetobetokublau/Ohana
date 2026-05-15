import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { fmtDate } from '@/lib/utils/dates';
import { PageHeader } from '@/components/shared/page-header';
import { Pill, Card } from '@/components/ui';

export const metadata = { title: 'Ohana · Discusión' };
export const dynamic = 'force-dynamic';

export default async function DiscusionDetailPage({ params }: { params: { id: string } }) {
  const { supabase, couple } = await requireCoupleContext();

  const { data: d } = await supabase
    .from('discusiones')
    .select(`
      id, nombre_evento, fecha, resumen, contexto_causante, que_aprendimos,
      tema_relacionado_id, created_at,
      autor:users!discusiones_creado_por_fkey(display_name),
      tema:temas(id, nombre_tema, estado)
    `)
    .eq('id', params.id)
    .eq('couple_id', couple.id)
    .maybeSingle();

  if (!d) redirect('/discusiones');

  const tema = d.tema as { id: string; nombre_tema: string; estado: string } | null;

  return (
    <div className="px-5 py-8 md:px-10 max-w-2xl mx-auto">
      <PageHeader
        eyebrow={d.fecha ? `Discusión · ${fmtDate(d.fecha)}` : 'Discusión'}
        title={d.nombre_evento}
      />

      <div className="meta mb-6">
        Creada por {(d.autor as { display_name?: string })?.display_name ?? '—'}
      </div>

      <div className="space-y-5">
        {d.resumen && (
          <Field label="Resumen">{d.resumen}</Field>
        )}
        {d.contexto_causante && (
          <Field label="Contexto causante">{d.contexto_causante}</Field>
        )}
        {d.que_aprendimos && (
          <Field label="Qué aprendimos">{d.que_aprendimos}</Field>
        )}

        {tema && (
          <Card>
            <div className="eyebrow mb-2">Tema vinculado</div>
            <Link href={`/temas/${tema.id}`} className="flex justify-between items-center">
              <div>
                <div className="font-medium">{tema.nombre_tema}</div>
                <Pill variant={tema.estado === 'resuelto' ? 'success' : 'default'} className="mt-1">
                  {tema.estado}
                </Pill>
              </div>
              <span className="text-muted">→</span>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow mb-2">{label}</div>
      <p className="text-[15px] leading-relaxed whitespace-pre-line">{children}</p>
    </div>
  );
}
