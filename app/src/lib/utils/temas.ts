/**
 * Constantes y helpers compartidos para el módulo Temas.
 * Centraliza priority + estado mappings que estaban duplicados en
 * /temas/page.tsx y /temas/[id]/page.tsx.
 */

import type { TemaEstado } from '@/lib/types';

export type TemaPrioridad = 'baja' | 'media' | 'alta' | 'urgente';

export const TEMA_PRIORIDADES: readonly TemaPrioridad[] = ['baja', 'media', 'alta', 'urgente'];

export const PRIORIDAD_BADGE: Record<TemaPrioridad, { label: string; color: string }> = {
  baja:    { label: 'Baja',    color: 'hsl(var(--mod-discus))' },
  media:   { label: 'Media',   color: 'hsl(var(--mod-fechas))' },
  alta:    { label: 'Alta',    color: 'hsl(var(--accent))' },
  urgente: { label: 'Urgente', color: 'hsl(var(--error))' },
};

export const TEMA_ESTADO_VARIANT: Record<TemaEstado, 'default' | 'accent' | 'success'> = {
  abierto: 'accent',
  en_discusion: 'default',
  resuelto: 'success',
  archivado: 'default',
};

/**
 * Orden de prioridad para sorting · urgente arriba, baja abajo.
 */
export const PRIORIDAD_ORDER: Record<TemaPrioridad, number> = {
  urgente: 0,
  alta: 1,
  media: 2,
  baja: 3,
};

/**
 * Resuelve la prioridad con fallback a 'media' si está null/inválida.
 */
export function resolvePrioridad(value: string | null | undefined): TemaPrioridad {
  if (value && value in PRIORIDAD_ORDER) return value as TemaPrioridad;
  return 'media';
}

/**
 * Compara dos temas para sort · primero por prioridad, luego por fecha desc.
 */
export function compareTemas<T extends { prioridad: string | null; created_at: string }>(
  a: T,
  b: T
): number {
  const aPrio = PRIORIDAD_ORDER[resolvePrioridad(a.prioridad)];
  const bPrio = PRIORIDAD_ORDER[resolvePrioridad(b.prioridad)];
  if (aPrio !== bPrio) return aPrio - bPrio;
  return b.created_at.localeCompare(a.created_at); // más reciente primero dentro del mismo prio
}
