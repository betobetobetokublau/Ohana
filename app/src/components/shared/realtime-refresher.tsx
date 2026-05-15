'use client';

import { useRealtimeRefresh } from '@/lib/utils/use-realtime-refresh';

/**
 * Componente client transparente · activa realtime refresh para una o más
 * suscripciones. No renderiza nada visible.
 *
 * Permite usarlo dentro de páginas server-rendered sin convertirlas en client.
 *
 * Uso típico (filtro por couple_id):
 *   <RealtimeRefresher
 *     subs={[
 *       { table: 'mood_checkins', filter: `couple_id=eq.${coupleId}` },
 *       { table: 'notification_events', filter: `user_id=eq.${userId}` },
 *     ]}
 *   />
 *
 * Si una subscription tiene `filter: null`, se ignora (útil cuando coupleId
 * podría ser undefined durante el primer render).
 */
interface Subscription {
  table: string;
  filter: string | null;
}

interface RealtimeRefresherProps {
  subs: Subscription[];
}

export function RealtimeRefresher({ subs }: RealtimeRefresherProps) {
  return (
    <>
      {subs.map(({ table, filter }) => (
        <TableSubscriber key={`${table}:${filter ?? 'off'}`} table={table} filter={filter} />
      ))}
    </>
  );
}

function TableSubscriber({ table, filter }: Subscription) {
  useRealtimeRefresh(table, filter);
  return null;
}
