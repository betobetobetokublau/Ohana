import { requireCoupleContext } from '@/lib/auth-helpers';
import { CalendarView } from './calendar-view';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { accionableColor, MODULE_COLOR } from '@/lib/utils/modules';
import { nextAnnualOccurrence } from '@/lib/utils/dates';
import type { CalendarEvent } from './types';

export const metadata = { title: 'Ohana · Calendario' };
export const dynamic = 'force-dynamic';

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const { supabase, couple } = await requireCoupleContext();

  // Mes a mostrar
  const baseDate = searchParams.month
    ? parseISO(`${searchParams.month}-01`)
    : new Date();
  const monthStart = startOfMonth(baseDate);
  const monthEnd = endOfMonth(baseDate);

  // Ventana extendida para próximos 14 días desde hoy (side panel)
  const now = new Date();
  const in14 = new Date(now);
  in14.setDate(in14.getDate() + 14);

  // Cargamos todos los eventos en paralelo
  const monthStartIso = monthStart.toISOString();
  const monthEndIso = monthEnd.toISOString();

  const [
    accionablesRes,
    citasRes,
    saludRes,
    revisionesRes,
    fechasRes,
    viajesRes,
    pagosRes,
  ] = await Promise.all([
    supabase
      .from('accionables')
      .select('id, titulo, tipo, due_date')
      .eq('couple_id', couple.id)
      .is('completado_at', null)
      .not('due_date', 'is', null)
      .gte('due_date', monthStartIso.slice(0, 10))
      .lte('due_date', monthEndIso.slice(0, 10)),
    supabase
      .from('citas_eventos')
      .select('id, fecha, idea:citas_ideas(nombre_actividad)')
      .eq('couple_id', couple.id)
      .gte('fecha', monthStartIso)
      .lte('fecha', monthEndIso),
    supabase
      .from('saludsexual_eventos')
      .select('id, nombre_actividad, fecha, tipo')
      .eq('couple_id', couple.id)
      .gte('fecha', monthStartIso)
      .lte('fecha', monthEndIso),
    supabase
      .from('saludsexual_revisiones')
      .select('id, tipo_revision, proxima_fecha')
      .eq('couple_id', couple.id)
      .gte('proxima_fecha', monthStartIso.slice(0, 10))
      .lte('proxima_fecha', monthEndIso.slice(0, 10)),
    supabase
      .from('fechas_clave')
      .select('id, titulo, fecha, icono')
      .eq('couple_id', couple.id),
    supabase
      .from('viajes_eventos')
      .select('id, nombre, fecha_inicio, fecha_fin')
      .eq('couple_id', couple.id)
      .or(`fecha_inicio.gte.${monthStartIso.slice(0, 10)},fecha_fin.gte.${monthStartIso.slice(0, 10)}`),
    supabase
      .from('pagos')
      .select('id, nombre, due_date, monto, pagado')
      .eq('couple_id', couple.id)
      .not('due_date', 'is', null)
      .gte('due_date', monthStartIso.slice(0, 10))
      .lte('due_date', monthEndIso.slice(0, 10)),
  ]);

  // Normalizar a CalendarEvent
  const events: CalendarEvent[] = [
    ...(accionablesRes.data ?? []).map(a => ({
      id: a.id,
      type: a.tipo,
      label: a.titulo,
      date: a.due_date!,
      color: accionableColor(a.tipo),
    })),
    ...(citasRes.data ?? []).map(c => ({
      id: c.id,
      type: 'cita',
      label: (c.idea as { nombre_actividad?: string } | null)?.nombre_actividad ?? 'Cita',
      date: c.fecha!.slice(0, 10),
      color: MODULE_COLOR.citas,
    })),
    ...(saludRes.data ?? []).map(s => ({
      id: s.id,
      type: 'saludsexual',
      label: s.nombre_actividad ?? 'Evento',
      date: s.fecha!.slice(0, 10),
      color: MODULE_COLOR.salud,
    })),
    ...(revisionesRes.data ?? []).map(r => ({
      id: r.id,
      type: 'revision',
      label: r.tipo_revision ?? 'Revisión',
      date: r.proxima_fecha,
      color: MODULE_COLOR.salud,
    })),
    ...(fechasRes.data ?? [])
      .filter(f => {
        const dt = parseISO(f.fecha);
        return dt >= monthStart && dt <= monthEnd;
      })
      .map(f => ({
        id: f.id,
        type: 'fecha',
        label: `${f.icono ?? '★'} ${f.titulo}`,
        date: f.fecha,
        color: MODULE_COLOR.fechas,
      })),
    ...(viajesRes.data ?? [])
      .filter(v => v.fecha_inicio)
      .map(v => ({
        id: v.id,
        type: 'viaje',
        label: v.nombre,
        date: v.fecha_inicio!,
        color: MODULE_COLOR.viajes,
      })),
    ...(pagosRes.data ?? []).map(p => ({
      id: p.id,
      type: 'pago',
      label: p.nombre,
      date: p.due_date!,
      color: MODULE_COLOR.gastos,
      completed: p.pagado,
    })),
  ];

  // Side panel: próximos 14 días desde hoy (independiente del mes mostrado)
  const sidePanelEvents = await loadSidePanelEvents(supabase, couple.id);

  return (
    <CalendarView
      monthStart={monthStart}
      events={events}
      sidePanelEvents={sidePanelEvents}
    />
  );
}

async function loadSidePanelEvents(
  supabase: Awaited<ReturnType<typeof requireCoupleContext>>['supabase'],
  coupleId: string
): Promise<CalendarEvent[]> {
  const now = new Date();
  const in14 = new Date(now);
  in14.setDate(in14.getDate() + 14);
  const nowIso = now.toISOString().slice(0, 10);
  const in14Iso = in14.toISOString().slice(0, 10);

  const [a, c, p, f, m] = await Promise.all([
    supabase
      .from('accionables')
      .select('id, titulo, tipo, due_date')
      .eq('couple_id', coupleId)
      .is('completado_at', null)
      .gte('due_date', nowIso)
      .lte('due_date', in14Iso),
    supabase
      .from('citas_eventos')
      .select('id, fecha, idea:citas_ideas(nombre_actividad)')
      .eq('couple_id', coupleId)
      .gte('fecha', now.toISOString())
      .lte('fecha', in14.toISOString()),
    supabase
      .from('pagos')
      .select('id, nombre, due_date, monto')
      .eq('couple_id', coupleId)
      .eq('pagado', false)
      .not('due_date', 'is', null)
      .gte('due_date', nowIso)
      .lte('due_date', in14Iso),
    supabase
      .from('fechas_clave')
      .select('id, titulo, fecha, icono'),
    supabase
      .from('viajes_eventos')
      .select('id, nombre, fecha_inicio')
      .eq('couple_id', coupleId)
      .gte('fecha_inicio', nowIso)
      .lte('fecha_inicio', in14Iso),
  ]);

  // Filtrar fechas_clave a las próximas en 14 días (considerando recurrencia anual)
  const upcomingFechas = (f.data ?? [])
    .map(fc => ({ ...fc, computed: nextAnnualOccurrence(fc.fecha, now) }))
    .filter(fc => fc.computed >= now && fc.computed <= in14);

  return [
    ...(a.data ?? []).map(x => ({
      id: x.id,
      type: x.tipo,
      label: x.titulo,
      date: x.due_date!,
      color: accionableColor(x.tipo),
    })),
    ...(c.data ?? []).map(x => ({
      id: x.id,
      type: 'cita',
      label: (x.idea as { nombre_actividad?: string } | null)?.nombre_actividad ?? 'Cita',
      date: x.fecha!.slice(0, 10),
      color: MODULE_COLOR.citas,
    })),
    ...(p.data ?? []).map(x => ({
      id: x.id,
      type: 'pago',
      label: `${x.nombre} · $${Number(x.monto).toLocaleString()}`,
      date: x.due_date!,
      color: MODULE_COLOR.gastos,
    })),
    ...upcomingFechas.map(x => ({
      id: x.id,
      type: 'fecha',
      label: `${x.icono ?? '★'} ${x.titulo}`,
      date: x.computed.toISOString().slice(0, 10),
      color: MODULE_COLOR.fechas,
    })),
    ...(m.data ?? []).map(x => ({
      id: x.id,
      type: 'viaje',
      label: x.nombre,
      date: x.fecha_inicio!,
      color: MODULE_COLOR.viajes,
    })),
  ].sort((x, y) => x.date.localeCompare(y.date));
}
