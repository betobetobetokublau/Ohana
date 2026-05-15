'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Suscribe a una tabla via Supabase Realtime y dispara `router.refresh()` cuando
 * llega un cambio que coincide con el filtro. La página se re-renderea en server
 * con datos frescos.
 *
 * Casos de uso (PRD v1.2):
 *  - Mood ad-hoc del partner aparece inmediato en el sparkline (§11.5)
 *  - Notificaciones nuevas se reflejan sin reload
 *  - Voto del partner en cita propuesta visible al instante
 *
 * Limitations:
 *  - Coarse-grained (refresh completo). Es OK para Phase 1-3.
 *  - Si necesitas optimización, reemplaza con state local.
 *
 * @param table Nombre de la tabla en `public`
 * @param filter Filtro estilo PostgREST · ej "couple_id=eq.abc" o "user_id=eq.xyz".
 *               Pasar null para deshabilitar la suscripción.
 */
export function useRealtimeRefresh(
  table: string,
  filter: string | null | undefined
) {
  const router = useRouter();

  useEffect(() => {
    if (!filter) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`realtime:${table}:${filter}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, router]);
}
