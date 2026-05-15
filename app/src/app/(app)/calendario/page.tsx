import { requireCoupleContext } from '@/lib/auth-helpers';
import { CalendarView } from './calendar-view';
import { startOfMonth, endOfMonth, parseISO, format, addDays } from 'date-fns';
import { accionableColor, MODULE_COLOR } from '@/lib/utils/modules';
import { nextAnnualOccurrence } from '@/lib/utils/dates';
import { expandRecurrence, parseDbDate, type Recurrence } from '@/lib/utils/calendar-events';
import { resolveAvatar } from '@/lib/utils/avatar';
import type { CalendarEvent } from './types';

export const metadata = { title: 'Ohana · Calendario' };
export const dynamic = 'force-dynamic';

const fmtDate = (d: Date) => format(d, 'yyyy-MM-dd');

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const { supabase, couple } = await requireCoupleContext();

  const baseDate = searchParams.month
    ? parseISO(`${searchParams.month}-01`)
    : new Date();
  const monthStart = startOfMonth(baseDate);
  const monthEnd = endOfMonth(baseDate);

  // Cargar usuarios del couple con avatar
  const { data: users } = await supabase
    .from('users')
    .select('id, display_name, avatar_emoji, avatar_color')
    .or(`id.eq.${couple.user_a_id},id.eq.${couple.user_b_id ?? couple.user_a_id}`);

  // Cargar TODOS los items relevantes · luego expandimos recurrencias
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
      .select('id, titulo, tipo, due_date, asignado_user_id, completado_at, recurrencia')
      .eq('couple_id', couple.id)
      .not('due_date', 'is', null),
    supabase
      .from('citas_eventos')
      .select('id, fecha, idea:citas_ideas(nombre_actividad)')
      .eq('couple_id', couple.id),
    supabase
      .from('saludsexual_eventos')
      .select('id, nombre_actividad, fecha, tipo')
      .eq('couple_id', couple.id),
    supabase
      .from('saludsexual_revisiones')
      .select('id, tipo_revision, proxima_fecha')
      .eq('couple_id', couple.id),
    supabase
      .from('fechas_clave')
      .select('id, titulo, fecha, icono, recurrencia')
      .eq('couple_id', couple.id),
    supabase
      .from('viajes_eventos')
      .select('id, nombre, fecha_inicio, fecha_fin')
      .eq('couple_id', couple.id),
    supabase
      .from('pagos')
      .select('id, nombre, due_date, monto, monto_variable, pagado, recurrencia, pagador_asignado')
      .eq('couple_id', couple.id)
      .not('due_date', 'is', null),
  ]);

  // Normalizar · expandir recurrencias dentro del mes
  const events: CalendarEvent[] = [];

  for (const a of accionablesRes.data ?? []) {
    if (!a.due_date) continue;
    const base = parseDbDate(a.due_date);
    const dates = expandRecurrence(base, a.recurrencia as Recurrence | null, monthStart, monthEnd);
    for (const dt of dates) {
      events.push({
        id: `${a.id}:${fmtDate(dt)}`,
        sourceId: a.id,
        type: a.tipo as CalendarEvent['type'],
        label: a.titulo,
        date: fmtDate(dt),
        color: accionableColor(a.tipo),
        completed: !!a.completado_at,
        assignedTo: a.asignado_user_id,
        category: capitalize(a.tipo),
      });
    }
  }

  for (const c of citasRes.data ?? []) {
    if (!c.fecha) continue;
    const dt = parseDbDate(c.fecha);
    if (dt >= monthStart && dt <= monthEnd) {
      events.push({
        id: c.id,
        sourceId: c.id,
        type: 'cita',
        label: (c.idea as { nombre_actividad?: string } | null)?.nombre_actividad ?? 'Cita',
        date: fmtDate(dt),
        color: MODULE_COLOR.citas,
        category: 'Cita',
      });
    }
  }

  for (const s of saludRes.data ?? []) {
    if (!s.fecha) continue;
    const dt = parseDbDate(s.fecha);
    if (dt >= monthStart && dt <= monthEnd) {
      events.push({
        id: s.id,
        sourceId: s.id,
        type: 'saludsexual',
        label: s.nombre_actividad ?? 'Evento',
        date: fmtDate(dt),
        color: MODULE_COLOR.salud,
        category: 'Salud sexual',
      });
    }
  }

  for (const r of revisionesRes.data ?? []) {
    const dt = parseDbDate(r.proxima_fecha);
    if (dt >= monthStart && dt <= monthEnd) {
      events.push({
        id: r.id,
        sourceId: r.id,
        type: 'revision',
        label: r.tipo_revision ?? 'Revisión',
        date: fmtDate(dt),
        color: MODULE_COLOR.salud,
        category: 'Revisión',
      });
    }
  }

  for (const f of fechasRes.data ?? []) {
    const base = parseDbDate(f.fecha);
    const rec = f.recurrencia as Recurrence | null;
    if (rec?.unit === 'years') {
      const dates = expandRecurrence(base, rec, monthStart, monthEnd);
      for (const dt of dates) {
        events.push({
          id: `${f.id}:${fmtDate(dt)}`,
          sourceId: f.id,
          type: 'fecha',
          label: `${f.icono ?? '★'} ${f.titulo}`,
          date: fmtDate(dt),
          color: MODULE_COLOR.fechas,
          category: 'Fecha clave',
        });
      }
    } else if (base >= monthStart && base <= monthEnd) {
      events.push({
        id: f.id,
        sourceId: f.id,
        type: 'fecha',
        label: `${f.icono ?? '★'} ${f.titulo}`,
        date: fmtDate(base),
        color: MODULE_COLOR.fechas,
        category: 'Fecha clave',
      });
    }
  }

  for (const v of viajesRes.data ?? []) {
    if (!v.fecha_inicio) continue;
    const dt = parseDbDate(v.fecha_inicio);
    if (dt >= monthStart && dt <= monthEnd) {
      events.push({
        id: v.id,
        sourceId: v.id,
        type: 'viaje',
        label: v.nombre,
        date: fmtDate(dt),
        color: MODULE_COLOR.viajes,
        category: 'Viaje',
      });
    }
  }

  for (const p of pagosRes.data ?? []) {
    if (!p.due_date) continue;
    const base = parseDbDate(p.due_date);
    const dates = expandRecurrence(base, p.recurrencia as Recurrence | null, monthStart, monthEnd);
    for (const dt of dates) {
      events.push({
        id: `${p.id}:${fmtDate(dt)}`,
        sourceId: p.id,
        type: 'pago',
        label: p.nombre,
        date: fmtDate(dt),
        color: MODULE_COLOR.gastos,
        completed: p.pagado,
        assignedTo: p.pagador_asignado,
        category: 'Pago',
        monto: p.monto_variable ? undefined : Number(p.monto),
        variableUnfilled: p.monto_variable && !p.pagado,
      });
    }
  }

  const sidePanelEvents = await loadSidePanelEvents(supabase, couple.id);

  const usersWithAvatar = (users ?? []).map(u => ({
    id: u.id,
    name: u.display_name ?? 'Usuario',
    avatar: resolveAvatar({ emoji: u.avatar_emoji, color: u.avatar_color }),
  }));

  return (
    <CalendarView
      monthStart={monthStart}
      events={events}
      sidePanelEvents={sidePanelEvents}
      users={usersWithAvatar}
    />
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ──────────────────────────────────────────────────────────────────────────────

async function loadSidePanelEvents(
  supabase: Awaited<ReturnType<typeof requireCoupleContext>>['supabase'],
  coupleId: string
): Promise<CalendarEvent[]> {
  const now = new Date();
  const in14 = addDays(now, 14);

  const [a, c, p, f, m] = await Promise.all([
    supabase
      .from('accionables')
      .select('id, titulo, tipo, due_date, asignado_user_id, completado_at, recurrencia')
      .eq('couple_id', coupleId)
      .not('due_date', 'is', null),
    supabase
      .from('citas_eventos')
      .select('id, fecha, idea:citas_ideas(nombre_actividad)')
      .eq('couple_id', coupleId),
    supabase
      .from('pagos')
      .select('id, nombre, due_date, monto, monto_variable, pagado, recurrencia, pagador_asignado')
      .eq('couple_id', coupleId)
      .not('due_date', 'is', null),
    supabase
      .from('fechas_clave')
      .select('id, titulo, fecha, icono, recurrencia')
      .eq('couple_id', coupleId),
    supabase
      .from('viajes_eventos')
      .select('id, nombre, fecha_inicio')
      .eq('couple_id', coupleId)
      .not('fecha_inicio', 'is', null),
  ]);

  const out: CalendarEvent[] = [];

  for (const x of a.data ?? []) {
    if (!x.due_date) continue;
    const base = parseDbDate(x.due_date);
    const dates = expandRecurrence(base, x.recurrencia as Recurrence | null, now, in14);
    for (const dt of dates) {
      // Skip si ya está completado y no es recurrente (otra ocurrencia futura)
      if (x.completado_at && dates.length === 1) continue;
      out.push({
        id: `${x.id}:${fmtDate(dt)}`,
        sourceId: x.id,
        type: x.tipo as CalendarEvent['type'],
        label: x.titulo,
        date: fmtDate(dt),
        color: accionableColor(x.tipo),
        completed: !!x.completado_at,
        assignedTo: x.asignado_user_id,
        category: capitalize(x.tipo),
      });
    }
  }
  for (const x of c.data ?? []) {
    if (!x.fecha) continue;
    const dt = parseDbDate(x.fecha);
    if (dt >= now && dt <= in14) {
      out.push({
        id: x.id,
        sourceId: x.id,
        type: 'cita',
        label: (x.idea as { nombre_actividad?: string } | null)?.nombre_actividad ?? 'Cita',
        date: fmtDate(dt),
        color: MODULE_COLOR.citas,
        category: 'Cita',
      });
    }
  }
  for (const x of p.data ?? []) {
    if (!x.due_date) continue;
    const base = parseDbDate(x.due_date);
    const dates = expandRecurrence(base, x.recurrencia as Recurrence | null, now, in14);
    for (const dt of dates) {
      out.push({
        id: `${x.id}:${fmtDate(dt)}`,
        sourceId: x.id,
        type: 'pago',
        label: x.nombre,
        date: fmtDate(dt),
        color: MODULE_COLOR.gastos,
        completed: false,
        assignedTo: x.pagador_asignado,
        category: 'Pago',
        monto: x.monto_variable ? undefined : Number(x.monto),
        variableUnfilled: x.monto_variable,
      });
    }
  }
  for (const x of f.data ?? []) {
    const rec = x.recurrencia as Recurrence | null;
    const computed = rec?.unit === 'years'
      ? nextAnnualOccurrence(x.fecha, now)
      : parseDbDate(x.fecha);
    if (computed >= now && computed <= in14) {
      out.push({
        id: `${x.id}:${fmtDate(computed)}`,
        sourceId: x.id,
        type: 'fecha',
        label: `${x.icono ?? '★'} ${x.titulo}`,
        date: fmtDate(computed),
        color: MODULE_COLOR.fechas,
        category: 'Fecha clave',
      });
    }
  }
  for (const x of m.data ?? []) {
    if (!x.fecha_inicio) continue;
    const dt = parseDbDate(x.fecha_inicio);
    if (dt >= now && dt <= in14) {
      out.push({
        id: x.id,
        sourceId: x.id,
        type: 'viaje',
        label: x.nombre,
        date: fmtDate(dt),
        color: MODULE_COLOR.viajes,
        category: 'Viaje',
      });
    }
  }

  return out.sort((a, b) => a.date.localeCompare(b.date));
}
