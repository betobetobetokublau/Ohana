import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fmtRel } from '@/lib/utils/dates';
import { accionableColor } from '@/lib/utils/modules';
import { Dot } from '@/components/ui';

export const metadata = { title: 'Ohana · Mis pendientes' };
export const dynamic = 'force-dynamic';

export default async function PendientesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: pendientes } = await supabase
    .from('accionables')
    .select('*')
    .eq('asignado_user_id', user.id)
    .is('completado_at', null)
    .order('due_date', { ascending: true });

  return (
    <div className="px-5 py-8 md:px-10 max-w-3xl mx-auto">
      <div className="eyebrow mb-2">Mis pendientes</div>
      <h1 className="display text-3xl">Lo que <em>te toca</em>.</h1>
      <p className="italic-serif text-[15px] mt-2 mb-7">
        Todos los accionables asignados a ti, en orden de fecha.
      </p>

      {!pendientes || pendientes.length === 0 ? (
        <div className="card-warm text-center">
          <p className="font-serif italic text-[15px] text-accent-deep">
            Sin pendientes. Disfruta el momento.
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-line rounded-md overflow-hidden">
          {pendientes.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-line' : ''}`}
            >
              <div className="w-4 h-4 border border-line-2 rounded-sm bg-bg flex-shrink-0" />
              <Dot color={accionableColor(p.tipo)} />
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium">{p.titulo}</div>
                <div className="meta uppercase text-[10px]">{p.tipo}</div>
              </div>
              {p.due_date && <span className="meta whitespace-nowrap">{fmtRel(p.due_date)}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
