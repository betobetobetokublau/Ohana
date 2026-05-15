export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accionables: {
        Row: {
          asignado_user_id: string | null
          completado_at: string | null
          completado_por: string | null
          couple_id: string
          created_at: string
          descripcion: string | null
          due_date: string | null
          id: string
          parent_discusion_id: string | null
          parent_mantenimiento_id: string | null
          parent_pago_id: string | null
          parent_proyecto_id: string | null
          parent_revision_id: string | null
          parent_viaje_id: string | null
          recurrencia: Json | null
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          asignado_user_id?: string | null
          completado_at?: string | null
          completado_por?: string | null
          couple_id: string
          created_at?: string
          descripcion?: string | null
          due_date?: string | null
          id?: string
          parent_discusion_id?: string | null
          parent_mantenimiento_id?: string | null
          parent_pago_id?: string | null
          parent_proyecto_id?: string | null
          parent_revision_id?: string | null
          parent_viaje_id?: string | null
          recurrencia?: Json | null
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          asignado_user_id?: string | null
          completado_at?: string | null
          completado_por?: string | null
          couple_id?: string
          created_at?: string
          descripcion?: string | null
          due_date?: string | null
          id?: string
          parent_discusion_id?: string | null
          parent_mantenimiento_id?: string | null
          parent_pago_id?: string | null
          parent_proyecto_id?: string | null
          parent_revision_id?: string | null
          parent_viaje_id?: string | null
          recurrencia?: Json | null
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accionables_asignado_user_id_fkey"
            columns: ["asignado_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accionables_completado_por_fkey"
            columns: ["completado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accionables_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      acuerdo_comentarios: {
        Row: {
          acuerdo_id: string
          contenido: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          acuerdo_id: string
          contenido: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          acuerdo_id?: string
          contenido?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "acuerdo_comentarios_acuerdo_id_fkey"
            columns: ["acuerdo_id"]
            isOneToOne: false
            referencedRelation: "acuerdos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acuerdo_comentarios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      acuerdo_discusion_links: {
        Row: {
          acuerdo_id: string
          discusion_id: string
        }
        Insert: {
          acuerdo_id: string
          discusion_id: string
        }
        Update: {
          acuerdo_id?: string
          discusion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "acuerdo_discusion_links_acuerdo_id_fkey"
            columns: ["acuerdo_id"]
            isOneToOne: false
            referencedRelation: "acuerdos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acuerdo_discusion_links_discusion_id_fkey"
            columns: ["discusion_id"]
            isOneToOne: false
            referencedRelation: "discusiones"
            referencedColumns: ["id"]
          },
        ]
      }
      acuerdo_versiones: {
        Row: {
          acuerdo_id: string
          cambiado_por: string | null
          cambios_resumen: string | null
          categoria: string | null
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
          version_num: number
        }
        Insert: {
          acuerdo_id: string
          cambiado_por?: string | null
          cambios_resumen?: string | null
          categoria?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
          version_num: number
        }
        Update: {
          acuerdo_id?: string
          cambiado_por?: string | null
          cambios_resumen?: string | null
          categoria?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          version_num?: number
        }
        Relationships: [
          {
            foreignKeyName: "acuerdo_versiones_acuerdo_id_fkey"
            columns: ["acuerdo_id"]
            isOneToOne: false
            referencedRelation: "acuerdos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acuerdo_versiones_cambiado_por_fkey"
            columns: ["cambiado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      acuerdos: {
        Row: {
          categoria: string | null
          couple_id: string
          creado_por: string | null
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
        }
        Insert: {
          categoria?: string | null
          couple_id: string
          creado_por?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
        }
        Update: {
          categoria?: string | null
          couple_id?: string
          creado_por?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "acuerdos_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acuerdos_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      checkin_comentarios: {
        Row: {
          checkin_id: string
          contenido: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          checkin_id: string
          contenido: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          checkin_id?: string
          contenido?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkin_comentarios_checkin_id_fkey"
            columns: ["checkin_id"]
            isOneToOne: false
            referencedRelation: "checkins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_comentarios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          comentarios: string | null
          couple_id: string
          deseo: number | null
          energia: number | null
          estado_animo: string | null
          id: string
          partner_energia_percibida: number | null
          partner_estres_percibido: string | null
          presion_trabajo: string | null
          submitted_at: string
          user_id: string
          week_of: string
        }
        Insert: {
          comentarios?: string | null
          couple_id: string
          deseo?: number | null
          energia?: number | null
          estado_animo?: string | null
          id?: string
          partner_energia_percibida?: number | null
          partner_estres_percibido?: string | null
          presion_trabajo?: string | null
          submitted_at?: string
          user_id: string
          week_of: string
        }
        Update: {
          comentarios?: string | null
          couple_id?: string
          deseo?: number | null
          energia?: number | null
          estado_animo?: string | null
          id?: string
          partner_energia_percibida?: number | null
          partner_estres_percibido?: string | null
          presion_trabajo?: string | null
          submitted_at?: string
          user_id?: string
          week_of?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkins_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      citas_eventos: {
        Row: {
          calificacion_user_a: number | null
          calificacion_user_b: number | null
          couple_id: string
          created_at: string
          fecha: string | null
          id: string
          idea_id: string | null
          lugar: string | null
          notas_user_a: string | null
          notas_user_b: string | null
          ratings_revealed_at: string | null
        }
        Insert: {
          calificacion_user_a?: number | null
          calificacion_user_b?: number | null
          couple_id: string
          created_at?: string
          fecha?: string | null
          id?: string
          idea_id?: string | null
          lugar?: string | null
          notas_user_a?: string | null
          notas_user_b?: string | null
          ratings_revealed_at?: string | null
        }
        Update: {
          calificacion_user_a?: number | null
          calificacion_user_b?: number | null
          couple_id?: string
          created_at?: string
          fecha?: string | null
          id?: string
          idea_id?: string | null
          lugar?: string | null
          notas_user_a?: string | null
          notas_user_b?: string | null
          ratings_revealed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citas_eventos_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citas_eventos_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "citas_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      citas_ideas: {
        Row: {
          archivada: boolean
          complejidad: string | null
          couple_id: string
          created_at: string
          duracion: Json | null
          id: string
          nombre_actividad: string
          presupuesto: number | null
          usuario_que_prefiere_id: string | null
        }
        Insert: {
          archivada?: boolean
          complejidad?: string | null
          couple_id: string
          created_at?: string
          duracion?: Json | null
          id?: string
          nombre_actividad: string
          presupuesto?: number | null
          usuario_que_prefiere_id?: string | null
        }
        Update: {
          archivada?: boolean
          complejidad?: string | null
          couple_id?: string
          created_at?: string
          duracion?: Json | null
          id?: string
          nombre_actividad?: string
          presupuesto?: number | null
          usuario_que_prefiere_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citas_ideas_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citas_ideas_usuario_que_prefiere_id_fkey"
            columns: ["usuario_que_prefiere_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      citas_propuestas: {
        Row: {
          consenso_idea_id: string | null
          couple_id: string
          created_at: string
          id: string
          idea_ids: string[]
          rationales: string[]
          resolved_at: string | null
          semana: string
          votos_user_a: string[] | null
          votos_user_b: string[] | null
        }
        Insert: {
          consenso_idea_id?: string | null
          couple_id: string
          created_at?: string
          id?: string
          idea_ids: string[]
          rationales: string[]
          resolved_at?: string | null
          semana: string
          votos_user_a?: string[] | null
          votos_user_b?: string[] | null
        }
        Update: {
          consenso_idea_id?: string | null
          couple_id?: string
          created_at?: string
          id?: string
          idea_ids?: string[]
          rationales?: string[]
          resolved_at?: string | null
          semana?: string
          votos_user_a?: string[] | null
          votos_user_b?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "citas_propuestas_consenso_idea_id_fkey"
            columns: ["consenso_idea_id"]
            isOneToOne: false
            referencedRelation: "citas_ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citas_propuestas_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      claude_consultas: {
        Row: {
          couple_id: string
          created_at: string
          escenario: string
          id: string
          respuesta: Json | null
          user_id: string
          verdict: string | null
        }
        Insert: {
          couple_id: string
          created_at?: string
          escenario: string
          id?: string
          respuesta?: Json | null
          user_id: string
          verdict?: string | null
        }
        Update: {
          couple_id?: string
          created_at?: string
          escenario?: string
          id?: string
          respuesta?: Json | null
          user_id?: string
          verdict?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claude_consultas_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claude_consultas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      couples: {
        Row: {
          anniversary_date: string | null
          created_at: string
          display_name: string
          id: string
          mimos_session_day: number
          updated_at: string
          user_a_id: string
          user_b_id: string | null
        }
        Insert: {
          anniversary_date?: string | null
          created_at?: string
          display_name: string
          id?: string
          mimos_session_day?: number
          updated_at?: string
          user_a_id: string
          user_b_id?: string | null
        }
        Update: {
          anniversary_date?: string | null
          created_at?: string
          display_name?: string
          id?: string
          mimos_session_day?: number
          updated_at?: string
          user_a_id?: string
          user_b_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couples_user_a_id_fkey"
            columns: ["user_a_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couples_user_b_id_fkey"
            columns: ["user_b_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      discusiones: {
        Row: {
          contexto_causante: string | null
          couple_id: string
          creado_por: string | null
          created_at: string
          fecha: string | null
          id: string
          nombre_evento: string
          que_aprendimos: string | null
          resumen: string | null
          tema_relacionado_id: string | null
        }
        Insert: {
          contexto_causante?: string | null
          couple_id: string
          creado_por?: string | null
          created_at?: string
          fecha?: string | null
          id?: string
          nombre_evento: string
          que_aprendimos?: string | null
          resumen?: string | null
          tema_relacionado_id?: string | null
        }
        Update: {
          contexto_causante?: string | null
          couple_id?: string
          creado_por?: string | null
          created_at?: string
          fecha?: string | null
          id?: string
          nombre_evento?: string
          que_aprendimos?: string | null
          resumen?: string | null
          tema_relacionado_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discusiones_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discusiones_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discusiones_tema_fk"
            columns: ["tema_relacionado_id"]
            isOneToOne: false
            referencedRelation: "temas"
            referencedColumns: ["id"]
          },
        ]
      }
      fechas_clave: {
        Row: {
          couple_id: string
          created_at: string
          descripcion: string | null
          fecha: string
          hora: string | null
          icono: string | null
          id: string
          recurrencia: Json | null
          titulo: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          descripcion?: string | null
          fecha: string
          hora?: string | null
          icono?: string | null
          id?: string
          recurrencia?: Json | null
          titulo: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          descripcion?: string | null
          fecha?: string
          hora?: string | null
          icono?: string | null
          id?: string
          recurrencia?: Json | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "fechas_clave_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          couple_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          message: string | null
          must_change_password: boolean
          temp_password_hash: string | null
        }
        Insert: {
          accepted_at?: string | null
          couple_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          message?: string | null
          must_change_password?: boolean
          temp_password_hash?: string | null
        }
        Update: {
          accepted_at?: string | null
          couple_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          message?: string | null
          must_change_password?: boolean
          temp_password_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mantenimiento_items: {
        Row: {
          couple_id: string
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
          recurrencia: Json | null
        }
        Insert: {
          couple_id: string
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
          recurrencia?: Json | null
        }
        Update: {
          couple_id?: string
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          recurrencia?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mantenimiento_items_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      mimo_reacciones: {
        Row: {
          contenido: string
          created_at: string
          id: string
          mimo_id: string
          user_id: string
        }
        Insert: {
          contenido: string
          created_at?: string
          id?: string
          mimo_id: string
          user_id: string
        }
        Update: {
          contenido?: string
          created_at?: string
          id?: string
          mimo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mimo_reacciones_mimo_id_fkey"
            columns: ["mimo_id"]
            isOneToOne: false
            referencedRelation: "mimos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mimo_reacciones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mimos: {
        Row: {
          autor_id: string
          couple_id: string
          created_at: string
          descripcion: string | null
          destinatario_id: string
          emocion_asociada: string | null
          id: string
          imagen_url: string | null
          revealed_in_session_id: string | null
          titulo: string
        }
        Insert: {
          autor_id: string
          couple_id: string
          created_at?: string
          descripcion?: string | null
          destinatario_id: string
          emocion_asociada?: string | null
          id?: string
          imagen_url?: string | null
          revealed_in_session_id?: string | null
          titulo: string
        }
        Update: {
          autor_id?: string
          couple_id?: string
          created_at?: string
          descripcion?: string | null
          destinatario_id?: string
          emocion_asociada?: string | null
          id?: string
          imagen_url?: string | null
          revealed_in_session_id?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "mimos_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mimos_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mimos_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mimos_revealed_in_session_id_fkey"
            columns: ["revealed_in_session_id"]
            isOneToOne: false
            referencedRelation: "mimos_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mimos_sessions: {
        Row: {
          couple_id: string
          created_at: string
          fecha_programada: string
          id: string
          realizada_at: string | null
        }
        Insert: {
          couple_id: string
          created_at?: string
          fecha_programada: string
          id?: string
          realizada_at?: string | null
        }
        Update: {
          couple_id?: string
          created_at?: string
          fecha_programada?: string
          id?: string
          realizada_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mimos_sessions_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_summaries: {
        Row: {
          couple_id: string
          generated_at: string
          id: string
          month_of: string
          narrativa_conexion: string | null
          narrativa_conflicto: string | null
          narrativa_intimidad: string | null
          narrativa_logistica: string | null
          stats: Json | null
        }
        Insert: {
          couple_id: string
          generated_at?: string
          id?: string
          month_of: string
          narrativa_conexion?: string | null
          narrativa_conflicto?: string | null
          narrativa_intimidad?: string | null
          narrativa_logistica?: string | null
          stats?: Json | null
        }
        Update: {
          couple_id?: string
          generated_at?: string
          id?: string
          month_of?: string
          narrativa_conexion?: string | null
          narrativa_conflicto?: string | null
          narrativa_intimidad?: string | null
          narrativa_logistica?: string | null
          stats?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_summaries_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_checkins: {
        Row: {
          couple_id: string
          created_at: string
          emocion: string
          id: string
          nota: string | null
          user_id: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          emocion: string
          id?: string
          nota?: string | null
          user_id: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          emocion?: string
          id?: string
          nota?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mood_checkins_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mood_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_events: {
        Row: {
          couple_id: string
          created_at: string
          email_sent_at: string | null
          id: string
          payload: Json
          read_at: string | null
          tipo: string
          user_id: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          email_sent_at?: string | null
          id?: string
          payload?: Json
          read_at?: string | null
          tipo: string
          user_id: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          email_sent_at?: string | null
          id?: string
          payload?: Json
          read_at?: string | null
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_events_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pago_instancias: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          monto: number
          pagado_en: string
          pagado_por: string | null
          pago_id: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          monto: number
          pagado_en?: string
          pagado_por?: string | null
          pago_id: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          monto?: number
          pagado_en?: string
          pagado_por?: string | null
          pago_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pago_instancias_pagado_por_fkey"
            columns: ["pagado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pago_instancias_pago_id_fkey"
            columns: ["pago_id"]
            isOneToOne: false
            referencedRelation: "pagos"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos: {
        Row: {
          categoria: string | null
          couple_id: string
          created_at: string
          due_date: string | null
          id: string
          monto: number
          monto_variable: boolean
          nombre: string
          pagado: boolean
          pagado_en: string | null
          pagador_asignado: string | null
          recurrencia: Json | null
        }
        Insert: {
          categoria?: string | null
          couple_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          monto: number
          monto_variable?: boolean
          nombre: string
          pagado?: boolean
          pagado_en?: string | null
          pagador_asignado?: string | null
          recurrencia?: Json | null
        }
        Update: {
          categoria?: string | null
          couple_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          monto?: number
          monto_variable?: boolean
          nombre?: string
          pagado?: boolean
          pagado_en?: string | null
          pagador_asignado?: string | null
          recurrencia?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_pagador_asignado_fkey"
            columns: ["pagador_asignado"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      proyecto_seguimientos: {
        Row: {
          autor_id: string
          contenido: string
          created_at: string
          fecha: string
          id: string
          proyecto_id: string
        }
        Insert: {
          autor_id: string
          contenido: string
          created_at?: string
          fecha: string
          id?: string
          proyecto_id: string
        }
        Update: {
          autor_id?: string
          contenido?: string
          created_at?: string
          fecha?: string
          id?: string
          proyecto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proyecto_seguimientos_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proyecto_seguimientos_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      proyectos: {
        Row: {
          ahorro_actual: number
          couple_id: string
          created_at: string
          descripcion: string | null
          estado: string
          fecha_objetivo: string | null
          id: string
          meta_ahorro: number | null
          nombre: string
        }
        Insert: {
          ahorro_actual?: number
          couple_id: string
          created_at?: string
          descripcion?: string | null
          estado?: string
          fecha_objetivo?: string | null
          id?: string
          meta_ahorro?: number | null
          nombre: string
        }
        Update: {
          ahorro_actual?: number
          couple_id?: string
          created_at?: string
          descripcion?: string | null
          estado?: string
          fecha_objetivo?: string | null
          id?: string
          meta_ahorro?: number | null
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "proyectos_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      saludsexual_comentarios: {
        Row: {
          contenido: string
          created_at: string
          evento_id: string
          id: string
          user_id: string
        }
        Insert: {
          contenido: string
          created_at?: string
          evento_id: string
          id?: string
          user_id: string
        }
        Update: {
          contenido?: string
          created_at?: string
          evento_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saludsexual_comentarios_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "saludsexual_eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saludsexual_comentarios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saludsexual_eventos: {
        Row: {
          couple_id: string
          created_at: string
          descripcion: string | null
          fecha: string | null
          id: string
          nombre_actividad: string | null
          tipo: string | null
        }
        Insert: {
          couple_id: string
          created_at?: string
          descripcion?: string | null
          fecha?: string | null
          id?: string
          nombre_actividad?: string | null
          tipo?: string | null
        }
        Update: {
          couple_id?: string
          created_at?: string
          descripcion?: string | null
          fecha?: string | null
          id?: string
          nombre_actividad?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saludsexual_eventos_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      saludsexual_revisiones: {
        Row: {
          completada: boolean
          couple_id: string
          created_at: string
          estudios_agrupados: boolean
          id: string
          proxima_fecha: string
          tipo_revision: string | null
          usuarios_asignados: string[]
        }
        Insert: {
          completada?: boolean
          couple_id: string
          created_at?: string
          estudios_agrupados?: boolean
          id?: string
          proxima_fecha: string
          tipo_revision?: string | null
          usuarios_asignados: string[]
        }
        Update: {
          completada?: boolean
          couple_id?: string
          created_at?: string
          estudios_agrupados?: boolean
          id?: string
          proxima_fecha?: string
          tipo_revision?: string | null
          usuarios_asignados?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "saludsexual_revisiones_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      tema_acuerdo_links: {
        Row: {
          acuerdo_id: string
          tema_id: string
          vinculado_at: string
          vinculado_por: string | null
        }
        Insert: {
          acuerdo_id: string
          tema_id: string
          vinculado_at?: string
          vinculado_por?: string | null
        }
        Update: {
          acuerdo_id?: string
          tema_id?: string
          vinculado_at?: string
          vinculado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tema_acuerdo_links_acuerdo_id_fkey"
            columns: ["acuerdo_id"]
            isOneToOne: false
            referencedRelation: "acuerdos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tema_acuerdo_links_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "temas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tema_acuerdo_links_vinculado_por_fkey"
            columns: ["vinculado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tema_timeline_entries: {
        Row: {
          autor_id: string | null
          contenido: string | null
          fecha: string
          id: string
          referencia_id: string | null
          tema_id: string
          tipo: string
        }
        Insert: {
          autor_id?: string | null
          contenido?: string | null
          fecha?: string
          id?: string
          referencia_id?: string | null
          tema_id: string
          tipo: string
        }
        Update: {
          autor_id?: string | null
          contenido?: string | null
          fecha?: string
          id?: string
          referencia_id?: string | null
          tema_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "tema_timeline_entries_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tema_timeline_entries_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "temas"
            referencedColumns: ["id"]
          },
        ]
      }
      temas: {
        Row: {
          acuerdo_resuelto_id: string | null
          couple_id: string
          created_at: string
          estado: string
          id: string
          nombre_tema: string
          prioridad: string | null
          resumen: string | null
        }
        Insert: {
          acuerdo_resuelto_id?: string | null
          couple_id: string
          created_at?: string
          estado?: string
          id?: string
          nombre_tema: string
          prioridad?: string | null
          resumen?: string | null
        }
        Update: {
          acuerdo_resuelto_id?: string | null
          couple_id?: string
          created_at?: string
          estado?: string
          id?: string
          nombre_tema?: string
          prioridad?: string | null
          resumen?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "temas_acuerdo_resuelto_id_fkey"
            columns: ["acuerdo_resuelto_id"]
            isOneToOne: false
            referencedRelation: "acuerdos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "temas_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_color: string | null
          avatar_emoji: string | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          must_change_password: boolean
          updated_at: string
        }
        Insert: {
          avatar_color?: string | null
          avatar_emoji?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          must_change_password?: boolean
          updated_at?: string
        }
        Update: {
          avatar_color?: string | null
          avatar_emoji?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          must_change_password?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      viajes_eventos: {
        Row: {
          caracteristicas: string | null
          couple_id: string
          created_at: string
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          nombre: string
          presupuesto: number | null
          revisiones: string | null
        }
        Insert: {
          caracteristicas?: string | null
          couple_id: string
          created_at?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre: string
          presupuesto?: number | null
          revisiones?: string | null
        }
        Update: {
          caracteristicas?: string | null
          couple_id?: string
          created_at?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre?: string
          presupuesto?: number | null
          revisiones?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viajes_eventos_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      viajes_wishlist: {
        Row: {
          agregado_por: string | null
          couple_id: string
          created_at: string
          descripcion: string | null
          id: string
          imagen_url: string | null
          interes_user_a: number | null
          interes_user_b: number | null
          nombre: string
          tipo: string | null
        }
        Insert: {
          agregado_por?: string | null
          couple_id: string
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          interes_user_a?: number | null
          interes_user_b?: number | null
          nombre: string
          tipo?: string | null
        }
        Update: {
          agregado_por?: string | null
          couple_id?: string
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          interes_user_a?: number | null
          interes_user_b?: number | null
          nombre?: string
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viajes_wishlist_agregado_por_fkey"
            columns: ["agregado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viajes_wishlist_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_couple_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
