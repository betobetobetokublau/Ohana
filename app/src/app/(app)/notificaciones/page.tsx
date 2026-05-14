import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fmtDate, fmtRel } from '@/lib/utils/dates';
import { Button } from '@/components/ui';

export const metadata = { title: 'Ohana · Notificaciones' };
export const dynamic = 'force-dynamic';

export default async function NotificacionesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: notifs } = await supabase
    .from('notification_events')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const unread = notifs?.filter(n => !n.read_at) ?? [];

  return (
    <div className="px-5 py-8 md:px-10 max-w-3xl mx-auto">
      <div className="flex justify-between items-baseline mb-8">
        <div>
          <div className="eyebrow">
            Notificaciones · {unread.length} sin leer
          </div>
          <h1 className="display text-3xl mt-1">Lo que <em>está pasando</em>.</h1>
        </div>
        {unread.length > 0 && <Button variant="ghost" size="sm">Marcar todas leídas</Button>}
      </div>

      {!notifs || notifs.length === 0 ? (
        <p className="italic-serif text-[15px] text-center py-12">
          Sin notificaciones todavía. Tu Monday digest llega cada lunes.
        </p>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div
              key={n.id}
              className={`rounded-md border border-line p-4 ${n.read_at ? '' : 'bg-surface'}`}
            >
              <div className="flex justify-between items-baseline">
                <div className="eyebrow">{n.tipo.replace(/_/g, ' ')}</div>
                <div className="meta">{fmtRel(n.created_at)}</div>
              </div>
              <pre className="font-sans text-[13px] mt-2 whitespace-pre-wrap text-ink">
                {JSON.stringify(n.payload, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
