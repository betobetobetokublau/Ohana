import Link from 'next/link';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { fmtRel } from '@/lib/utils/dates';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui';
import { MantRow } from './row';

export const metadata = { title: 'Ohana · Mantenimiento' };
export const dynamic = 'force-dynamic';

type Accionable = {
  id: string;
  titulo: string;
  descripcion: string | null;
  due_date: string | null;
  asignado_user_id: string | null;
  completado_at: string | null;
  recurrencia: { value: number; unit: string } | null;
};

export default async function MantenimientoPage() {
  const { supabase, couple } = await requireCoupleContext();

  const { data: items } = await supabase
    .from('accionables')
    .select('id, titulo, descripcion, due_date, asignado_user_id, completado_at, recurrencia')
    .eq('couple_id', couple.id)
    .eq('tipo', 'mantenimiento')
    .order('due_date', { ascending: true, nullsFirst: false })
    .returns<Accionable[]>();

  const now = new Date();
  const in7Days = new Date(now);
  in7Days.setDate(in7Days.getDate() + 7);

  const vencidas = (items ?? []).filter(
    i => !i.completado_at && i.due_date && new Date(i.due_date) < now
  );
  const estaSemana = (items ?? []).filter(
    i => !i.completado_at && i.due_date && new Date(i.due_date) >= now && new Date(i.due_date) <= in7Days
  );
  const proximas = (items ?? []).filter(
    i => !i.completado_at && (!i.due_date || new Date(i.due_date) > in7Days)
  );
  const completadas = (items ?? []).filter(i => i.completado_at).slice(0, 10);

  return (
    <div className="px-5 py-8 md:px-10 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Mantenimiento del depa"
        title="El depa"
        titleAccent="al día"
        subtitle="Tareas únicas o recurrentes. Al completar una recurrente, el trigger regenera la siguiente automáticamente."
        actions={
          <Link href="/mantenimiento/nuevo">
            <Button variant="accent" size="sm">+ Nueva tarea</Button>
          </Link>
        }
      />

      {!items || items.length === 0 ? (
        <EmptyState
          title="Sin tareas de mantenimiento"
          description="Filtros de AC, riego de plantas, limpieza profunda, cambio de focos…"
          action={
            <Link href="/mantenimiento/nuevo">
              <Button variant="accent">Crear primera tarea</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {vencidas.length > 0 && (
            <Section title="Vencidas" count={vencidas.length} accent>
              {vencidas.map(i => <MantRow key={i.id} item={i} />)}
            </Section>
          )}
          {estaSemana.length > 0 && (
            <Section title="Esta semana" count={estaSemana.length}>
              {estaSemana.map(i => <MantRow key={i.id} item={i} />)}
            </Section>
          )}
          {proximas.length > 0 && (
            <Section title="Próximas" count={proximas.length}>
              {proximas.map(i => <MantRow key={i.id} item={i} />)}
            </Section>
          )}
          {completadas.length > 0 && (
            <Section title="Recientemente completadas" count={completadas.length}>
              {completadas.map(i => <MantRow key={i.id} item={i} />)}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  count,
  accent,
  children,
}: {
  title: string;
  count: number;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className={`eyebrow mb-3 ${accent ? 'text-error' : ''}`}>
        {title} · {count}
      </div>
      <div className="bg-surface border border-line rounded-md overflow-hidden">
        {children}
      </div>
    </section>
  );
}
