/**
 * Domain types · enums del PRD v1.2 expresados como literal unions.
 *
 * El archivo `@/types/database.ts` se regenera con `bun run db:types` y traduce
 * los CHECK constraints de Postgres a `string`, así que mantenemos aquí las
 * uniones literales para type-safety en formularios y components.
 */

export type EstadoAnimo = 'feliz' | 'triste' | 'neutral' | 'agotado';

export type PresionTrabajo = 'baja' | 'mediana' | 'alta' | 'extrema';

export type MoodEmocion =
  | 'carinoso'
  | 'feliz'
  | 'tranquilo'
  | 'neutral'
  | 'agotado'
  | 'ansioso'
  | 'triste'
  | 'frustrado';

export type MimoEmocion =
  | 'gratitud'
  | 'ternura'
  | 'admiracion'
  | 'orgullo'
  | 'diversion'
  | 'deseo'
  | 'paz';

export type AcuerdoCategoria =
  | 'comunicacion'
  | 'dinero'
  | 'familia'
  | 'tiempo'
  | 'intimidad'
  | 'hogar'
  | 'otros';

export type AccionableTipo =
  | 'pago'
  | 'proyecto'
  | 'mantenimiento'
  | 'viaje'
  | 'discusion'
  | 'saludsexual'
  | 'revision';

export type ClaudeVerdict = 'no_concern' | 'talk_first' | 'violation' | 'ambiguous';

export type TemaEstado = 'abierto' | 'en_discusion' | 'resuelto' | 'archivado';

export type ProyectoEstado = 'activo' | 'pausado' | 'completado' | 'cancelado';

export type Recurrencia = {
  value: number;
  unit: 'days' | 'weeks' | 'months' | 'years';
};
