import { format, startOfWeek, isSameDay, parseISO, differenceInCalendarDays } from 'date-fns';
import { es } from 'date-fns/locale';

export function fmtRel(dateStr: string | Date, now: Date = new Date()): string {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  // Calendar days · ignora hora, cuenta fechas. "vence may 19 a las 8am, hoy es
  // may 14 al mediodía" debe decir "en 5 días", no "en 4 días".
  const diff = differenceInCalendarDays(date, now);
  if (diff === 0) return 'hoy';
  if (diff === 1) return 'mañana';
  if (diff === -1) return 'ayer';
  if (diff > 0 && diff < 14) return `en ${diff} días`;
  if (diff < 0 && diff > -14) return `hace ${Math.abs(diff)} días`;
  return format(date, 'd MMM', { locale: es });
}

export function fmtDate(date: string | Date, pattern: string = 'EEE d MMM'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: es });
}

export function fmtDateShort(date: string | Date): string {
  return fmtDate(date, 'd MMM');
}

export function fmtWeekOf(date: string | Date = new Date()): string {
  const monday = startOfWeek(typeof date === 'string' ? parseISO(date) : date, { weekStartsOn: 1 });
  return format(monday, 'yyyy-MM-dd');
}

export function greeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export { isSameDay, parseISO };
