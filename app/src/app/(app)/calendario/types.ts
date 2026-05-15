export type CalendarEvent = {
  /** ID único · combinación de sourceId + fecha para items recurrentes expandidos */
  id: string;
  /** ID del row original en DB · usado para mark-as-done */
  sourceId: string;
  /** Tipo del módulo · color + deep-link */
  type: 'pago' | 'mantenimiento' | 'proyecto' | 'viaje' | 'discusion' | 'saludsexual' | 'revision' | 'cita' | 'fecha' | 'mimos-session';
  /** Display label */
  label: string;
  /** Fecha en formato yyyy-MM-dd · siempre local */
  date: string;
  /** Color del módulo · CSS color */
  color: string;
  /** Si tiene estado completado · null si no aplica */
  completed?: boolean;
  /** ID del usuario asignado · null si no asignado */
  assignedTo?: string | null;
  /** Categoría legible · ej "Pago", "Mantenimiento" */
  category?: string;
  /** Monto en MXN si aplica */
  monto?: number;
  /** True si es pago variable sin monto capturado para esta instancia */
  variableUnfilled?: boolean;
};
