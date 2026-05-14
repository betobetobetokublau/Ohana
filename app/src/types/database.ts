/**
 * Database types · stub manual.
 *
 * Para generar el archivo completo con tipos exactos contra tu schema:
 *   bun run db:types
 *
 * Requiere haber linkeado el proyecto Supabase con:
 *   bunx supabase link --project-ref <tu-project-ref>
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Enums del schema
export type EstadoAnimo = 'feliz' | 'triste' | 'neutral' | 'agotado';
export type PresionTrabajo = 'baja' | 'mediana' | 'alta' | 'extrema';
export type MoodEmocion =
  | 'carinoso' | 'feliz' | 'tranquilo' | 'neutral'
  | 'agotado' | 'ansioso' | 'triste' | 'frustrado';
export type MimoEmocion = 'gratitud' | 'ternura' | 'admiracion' | 'orgullo' | 'diversion' | 'deseo' | 'paz';
export type AcuerdoCategoria = 'comunicacion' | 'dinero' | 'familia' | 'tiempo' | 'intimidad' | 'hogar' | 'otros';
export type AccionableTipo = 'pago' | 'proyecto' | 'mantenimiento' | 'viaje' | 'discusion' | 'saludsexual' | 'revision';
export type ClaudeVerdict = 'no_concern' | 'talk_first' | 'violation' | 'ambiguous';
export type TemaEstado = 'abierto' | 'en_discusion' | 'resuelto' | 'archivado';
export type ProyectoEstado = 'activo' | 'pausado' | 'completado' | 'cancelado';
export type Recurrencia = { value: number; unit: 'days' | 'weeks' | 'months' | 'years' };

export interface Database {
  public: {
    Tables: {
      users: {
        Row: { id: string; email: string; display_name: string | null; avatar_url: string | null; created_at: string; updated_at: string };
        Insert: { id: string; email: string; display_name?: string | null; avatar_url?: string | null };
        Update: Partial<Database['public']['Tables']['users']['Row']>;
      };
      couples: {
        Row: { id: string; display_name: string; user_a_id: string; user_b_id: string | null; anniversary_date: string | null; mimos_session_day: number; created_at: string; updated_at: string };
        Insert: { display_name: string; user_a_id: string; user_b_id?: string | null; anniversary_date?: string | null };
        Update: Partial<Database['public']['Tables']['couples']['Row']>;
      };
      invitations: {
        Row: { id: string; couple_id: string; invited_by: string; email: string; message: string | null; accepted_at: string | null; expires_at: string; created_at: string };
        Insert: { couple_id: string; invited_by: string; email: string; message?: string | null };
        Update: Partial<Database['public']['Tables']['invitations']['Row']>;
      };
      accionables: {
        Row: { id: string; couple_id: string; titulo: string; descripcion: string | null; tipo: AccionableTipo; due_date: string | null; asignado_user_id: string | null; completado_at: string | null; completado_por: string | null; recurrencia: Recurrencia | null; created_at: string; updated_at: string };
        Insert: { couple_id: string; titulo: string; tipo: AccionableTipo; descripcion?: string | null; due_date?: string | null; asignado_user_id?: string | null; recurrencia?: Recurrencia | null };
        Update: Partial<Database['public']['Tables']['accionables']['Row']>;
      };
      checkins: {
        Row: { id: string; couple_id: string; user_id: string; week_of: string; estado_animo: EstadoAnimo | null; energia: number | null; deseo: number | null; presion_trabajo: PresionTrabajo | null; comentarios: string | null; partner_energia_percibida: number | null; partner_estres_percibido: PresionTrabajo | null; submitted_at: string };
        Insert: { couple_id: string; user_id: string; week_of: string; estado_animo?: EstadoAnimo | null; energia?: number | null; deseo?: number | null; presion_trabajo?: PresionTrabajo | null; comentarios?: string | null; partner_energia_percibida?: number | null; partner_estres_percibido?: PresionTrabajo | null };
        Update: Partial<Database['public']['Tables']['checkins']['Row']>;
      };
      mood_checkins: {
        Row: { id: string; couple_id: string; user_id: string; emocion: MoodEmocion; nota: string | null; created_at: string };
        Insert: { couple_id: string; user_id: string; emocion: MoodEmocion; nota?: string | null };
        Update: Partial<Database['public']['Tables']['mood_checkins']['Row']>;
      };
      mimos: {
        Row: { id: string; couple_id: string; autor_id: string; destinatario_id: string; titulo: string; descripcion: string | null; imagen_url: string | null; emocion_asociada: MimoEmocion | null; revealed_in_session_id: string | null; created_at: string };
        Insert: { couple_id: string; autor_id: string; destinatario_id: string; titulo: string; descripcion?: string | null; imagen_url?: string | null; emocion_asociada?: MimoEmocion | null };
        Update: Partial<Database['public']['Tables']['mimos']['Row']>;
      };
      acuerdos: {
        Row: { id: string; couple_id: string; nombre: string; descripcion: string | null; categoria: AcuerdoCategoria | null; creado_por: string | null; created_at: string };
        Insert: { couple_id: string; nombre: string; descripcion?: string | null; categoria?: AcuerdoCategoria | null; creado_por?: string | null };
        Update: Partial<Database['public']['Tables']['acuerdos']['Row']>;
      };
      pagos: {
        Row: { id: string; couple_id: string; nombre: string; monto: number; categoria: string | null; pagador_asignado: string | null; recurrencia: Recurrencia | null; due_date: string | null; pagado: boolean; pagado_en: string | null; created_at: string };
        Insert: { couple_id: string; nombre: string; monto: number; categoria?: string | null; pagador_asignado?: string | null; recurrencia?: Recurrencia | null; due_date?: string | null };
        Update: Partial<Database['public']['Tables']['pagos']['Row']>;
      };
      notification_events: {
        Row: { id: string; couple_id: string; user_id: string; tipo: string; payload: Json; read_at: string | null; email_sent_at: string | null; created_at: string };
        Insert: { couple_id: string; user_id: string; tipo: string; payload?: Json };
        Update: Partial<Database['public']['Tables']['notification_events']['Row']>;
      };
      // ... otras tablas (citas_*, viajes_*, etc.) seguirán el mismo patrón.
      // El comando `bun run db:types` generará la lista completa.
    };
  };
}
