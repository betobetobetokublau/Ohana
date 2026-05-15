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

/**
 * Calcula la próxima ocurrencia de una fecha que se repite anualmente.
 *
 * - Si la fecha ya pasó este año, regresa la del próximo año
 * - Si aún no pasa, regresa la de este año
 * - Edge case: 29 feb en año no bisiesto → 28 feb (date-fns + Date hacen rollover
 *   a 1 marzo, lo corregimos manualmente para preservar la intuición de aniversario)
 *
 * @param anniversaryDate · fecha original del aniversario (cualquier año)
 * @param now · fecha actual (default: hoy)
 * @returns Date · próxima ocurrencia del aniversario
 */
export function nextAnnualOccurrence(
  anniversaryDate: string | Date,
  now: Date = new Date()
): Date {
  const original = typeof anniversaryDate === 'string'
    ? parseISO(anniversaryDate)
    : anniversaryDate;

  const month = original.getMonth();
  const day = original.getDate();
  const isFeb29 = month === 1 && day === 29;

  // Empezamos con el año actual
  let year = now.getFullYear();
  let candidate = buildAnniversaryDate(year, month, day, isFeb29);

  // Si ya pasó (cuenta calendar-day, ignorando hora), buscar el próximo año
  while (candidate < startOfDay(now)) {
    year++;
    candidate = buildAnniversaryDate(year, month, day, isFeb29);
  }

  return candidate;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function buildAnniversaryDate(year: number, month: number, day: number, isFeb29: boolean): Date {
  if (isFeb29) {
    // Si es bisiesto, día 29 de febrero. Si no, 28 (preservar el "es en febrero" del aniversario).
    const leap = isLeapYear(year);
    return new Date(year, 1, leap ? 29 : 28);
  }
  return new Date(year, month, day);
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
