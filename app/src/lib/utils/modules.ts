/**
 * Single source of truth para colores e iconos por módulo.
 * Cualquier visualización que necesite "el color del módulo X" debe consultar aquí.
 *
 * Los valores CSS vars están definidos en `src/app/globals.css` bajo `:root`.
 */

import type { AccionableTipo, AcuerdoCategoria } from '@/lib/types';

/**
 * Mapa de tipo de accionable → token CSS color.
 * Los accionables son la entidad transversal (PRD v1.0 §5.1) y aparecen en
 * Calendario, Hoy, Pendientes, listados por módulo.
 */
export const ACCIONABLE_COLOR: Record<AccionableTipo, string> = {
  pago: 'hsl(var(--mod-gastos))',
  proyecto: 'hsl(var(--mod-proyectos))',
  mantenimiento: 'hsl(var(--mod-mant))',
  viaje: 'hsl(var(--mod-viajes))',
  discusion: 'hsl(var(--mod-discus))',
  saludsexual: 'hsl(var(--mod-salud))',
  revision: 'hsl(var(--mod-salud))',
};

/**
 * Mapa por nombre de módulo (string) para fuentes no-accionable (citas, fechas, mimos).
 * Usado en Calendario para eventos que no viven en `accionables`.
 */
export const MODULE_COLOR = {
  citas: 'hsl(var(--mod-citas))',
  salud: 'hsl(var(--mod-salud))',
  gastos: 'hsl(var(--mod-gastos))',
  proyectos: 'hsl(var(--mod-proyectos))',
  mantenimiento: 'hsl(var(--mod-mant))',
  viajes: 'hsl(var(--mod-viajes))',
  fechas: 'hsl(var(--mod-fechas))',
  discusiones: 'hsl(var(--mod-discus))',
  mimos: 'hsl(var(--mod-mimos))',
  ink: 'hsl(var(--ink))',
} as const;

/**
 * Mapa de categoría de acuerdo → color (PRD v1.0 §6.10).
 * Las categorías de acuerdos se mapean a colores de módulos relacionados:
 * comunicación → discus, dinero → gastos, familia → citas, etc.
 */
export const ACUERDO_CATEGORIA_COLOR: Record<AcuerdoCategoria, string> = {
  comunicacion: MODULE_COLOR.discusiones,
  dinero: MODULE_COLOR.gastos,
  familia: MODULE_COLOR.citas,
  tiempo: MODULE_COLOR.ink,
  intimidad: MODULE_COLOR.salud,
  hogar: MODULE_COLOR.mantenimiento,
  otros: 'hsl(var(--muted))',
};

export const ACUERDO_CATEGORIA_LABEL: Record<AcuerdoCategoria, string> = {
  comunicacion: 'Comunicación',
  dinero: 'Dinero',
  familia: 'Familia',
  tiempo: 'Tiempo',
  intimidad: 'Intimidad',
  hogar: 'Hogar',
  otros: 'Otros',
};

/**
 * Helper · regresa el color de un accionable con fallback a ink.
 */
export function accionableColor(tipo: string): string {
  return ACCIONABLE_COLOR[tipo as AccionableTipo] ?? MODULE_COLOR.ink;
}
