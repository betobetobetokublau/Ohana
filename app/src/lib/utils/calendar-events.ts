/**
 * Lógica para expandir eventos recurrentes en un rango de fechas.
 *
 * Los items recurrentes (mantenimiento "cada 6 meses", pagos "cada mes", fechas
 * clave anuales) se guardan UNA vez en DB pero deben aparecer en múltiples
 * fechas en la vista del calendario.
 */

import { addDays, addMonths, addWeeks, addYears, parseISO, isWithinInterval } from 'date-fns';

export type Recurrence = { value: number; unit: 'days' | 'weeks' | 'months' | 'years' };

/**
 * Genera todas las ocurrencias de un item recurrente que caigan en el rango dado.
 * Si no hay recurrencia, regresa solo la fecha base si está en el rango.
 *
 * @param startDate · primera fecha del item
 * @param recurrence · regla de recurrencia (null si no es recurrente)
 * @param rangeStart · inicio del rango a generar (inclusive)
 * @param rangeEnd · fin del rango (inclusive)
 * @param maxOccurrences · safety limit · default 1000
 */
export function expandRecurrence(
  startDate: Date,
  recurrence: Recurrence | null,
  rangeStart: Date,
  rangeEnd: Date,
  maxOccurrences: number = 1000
): Date[] {
  // Sin recurrencia: solo la fecha base si está en el rango
  if (!recurrence) {
    return isWithinInterval(startDate, { start: rangeStart, end: rangeEnd }) ? [startDate] : [];
  }

  const occurrences: Date[] = [];
  let current = startDate;
  let count = 0;

  // Si la fecha base está antes del rango, avanzar hasta entrar
  while (current < rangeStart && count < maxOccurrences) {
    current = advance(current, recurrence);
    count++;
  }

  // Generar ocurrencias dentro del rango
  while (current <= rangeEnd && count < maxOccurrences) {
    occurrences.push(current);
    current = advance(current, recurrence);
    count++;
  }

  return occurrences;
}

function advance(date: Date, recurrence: Recurrence): Date {
  switch (recurrence.unit) {
    case 'days':   return addDays(date, recurrence.value);
    case 'weeks':  return addWeeks(date, recurrence.value);
    case 'months': return addMonths(date, recurrence.value);
    case 'years':  return addYears(date, recurrence.value);
  }
}

/**
 * Parse una fecha de DB (puede ser string YYYY-MM-DD o ISO completo).
 * Mantiene la fecha local sin shift por timezone.
 */
export function parseDbDate(value: string): Date {
  if (value.includes('T')) return parseISO(value);
  // YYYY-MM-DD · construir como local date sin shift
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}
