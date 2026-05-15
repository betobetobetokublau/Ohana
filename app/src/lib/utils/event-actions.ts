/**
 * Helpers compartidos para acciones sobre CalendarEvent.
 * Centraliza canMarkAsDone + getDetailHref que estaban duplicados en
 * /calendario/day-detail-modal.tsx y /calendario/side-panel-row.tsx.
 */

import type { CalendarEvent } from '@/app/(app)/calendario/types';

/**
 * Tipos de evento que aceptan toggle "marcar como hecho".
 * Citas + fechas-clave no se marcan como completadas · simplemente ocurren.
 */
const TOGGLABLE_TYPES: ReadonlySet<CalendarEvent['type']> = new Set([
  'pago',
  'mantenimiento',
  'proyecto',
  'viaje',
  'discusion',
  'saludsexual',
  'revision',
]);

export function canMarkAsDone(type: CalendarEvent['type']): boolean {
  return TOGGLABLE_TYPES.has(type);
}

/**
 * Regresa la URL del detalle de un evento, o null si no hay deep-link.
 * - pagos / mantenimiento / viajes / citas / fechas → listing (no hay /[id] todavía)
 * - proyectos / discusiones → detalle por id
 * - salud sexual → único módulo
 */
export function getDetailHref(event: CalendarEvent): string | null {
  switch (event.type) {
    case 'pago':          return '/pagos';
    case 'mantenimiento': return '/mantenimiento';
    case 'proyecto':      return `/proyectos/${event.sourceId}`;
    case 'viaje':         return '/viajes';
    case 'cita':          return '/citas/eventos';
    case 'discusion':     return `/discusiones/${event.sourceId}`;
    case 'fecha':         return '/fechas-clave';
    case 'saludsexual':
    case 'revision':      return '/salud-sexual';
    default:              return null;
  }
}
