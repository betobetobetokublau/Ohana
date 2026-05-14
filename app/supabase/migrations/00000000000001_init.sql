-- ════════════════════════════════════════════════════════════════════════════
-- Ohana · schema inicial · PRD v1.2
-- ════════════════════════════════════════════════════════════════════════════
-- Orden de creación:
--   1. Extensions
--   2. Core (users, couples, invitations)
--   3. Accionables (transversal)
--   4. Módulos: citas, salud sexual, proyectos, viajes, fechas clave
--   5. Salud emocional: checkins, mood_checkins, mimos
--   6. Conversación: acuerdos, discusiones, temas
--   7. Sistema: notification_events, monthly_summaries
--   8. Triggers (recurrencia, user creation)
--   9. RLS policies
-- ════════════════════════════════════════════════════════════════════════════

-- ─── 1. Extensions ─────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── 2. Core ───────────────────────────────────────────────────────────────

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  user_a_id uuid not null references public.users(id) on delete cascade,
  user_b_id uuid references public.users(id) on delete cascade,
  anniversary_date date,
  mimos_session_day integer not null default 0, -- 0 = primer domingo del mes
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helper: obtener couple_id del usuario actual.
create or replace function public.current_couple_id()
returns uuid
language sql
stable
security definer
as $$
  select id from public.couples
  where user_a_id = auth.uid() or user_b_id = auth.uid()
  limit 1;
$$;

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  invited_by uuid not null references public.users(id) on delete cascade,
  email text not null,
  message text,
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

create index idx_invitations_email on public.invitations(email) where accepted_at is null;

-- ─── 3. Accionables (transversal) ──────────────────────────────────────────

create table public.accionables (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  titulo text not null,
  descripcion text,
  tipo text not null check (tipo in ('pago','proyecto','mantenimiento','viaje','discusion','saludsexual','revision')),
  due_date date,
  asignado_user_id uuid references public.users(id) on delete set null,
  completado_at timestamptz,
  completado_por uuid references public.users(id) on delete set null,

  -- Parent FKs (al menos uno opcional según tipo)
  parent_pago_id uuid,
  parent_proyecto_id uuid,
  parent_mantenimiento_id uuid,
  parent_viaje_id uuid,
  parent_discusion_id uuid,
  parent_revision_id uuid,

  recurrencia jsonb, -- { value: int, unit: 'days' | 'weeks' | 'months' | 'years' }

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_accionables_due on public.accionables(couple_id, due_date) where completado_at is null;
create index idx_accionables_assignee on public.accionables(asignado_user_id, due_date) where completado_at is null;
create index idx_accionables_couple_tipo on public.accionables(couple_id, tipo);

-- ─── 4. Módulo: Citas ──────────────────────────────────────────────────────

create table public.citas_ideas (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  nombre_actividad text not null,
  duracion jsonb, -- { value: int, unit: 'horas' | 'dias' }
  complejidad text check (complejidad in ('baja','media','alta')),
  presupuesto numeric,
  usuario_que_prefiere_id uuid references public.users(id) on delete set null,
  archivada boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_citas_ideas_couple on public.citas_ideas(couple_id) where archivada = false;

create table public.citas_propuestas (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  semana date not null, -- lunes de la semana
  idea_ids uuid[] not null check (array_length(idea_ids, 1) = 3),
  rationales text[] not null check (array_length(rationales, 1) = 3),
  votos_user_a uuid[],
  votos_user_b uuid[],
  consenso_idea_id uuid references public.citas_ideas(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  unique(couple_id, semana)
);

create table public.citas_eventos (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  idea_id uuid references public.citas_ideas(id) on delete set null,
  fecha timestamptz,
  lugar text,
  calificacion_user_a integer check (calificacion_user_a between 1 and 5),
  calificacion_user_b integer check (calificacion_user_b between 1 and 5),
  notas_user_a text,
  notas_user_b text,
  ratings_revealed_at timestamptz, -- ambos enviados
  created_at timestamptz not null default now()
);

create index idx_citas_eventos_couple_fecha on public.citas_eventos(couple_id, fecha desc);

-- ─── 4. Módulo: SaludSexual ────────────────────────────────────────────────

create table public.saludsexual_eventos (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  nombre_actividad text,
  tipo text check (tipo in ('evento','salida')), -- evento = en casa, salida = fuera
  fecha timestamptz,
  descripcion text,
  created_at timestamptz not null default now()
);

create table public.saludsexual_comentarios (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.saludsexual_eventos(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  contenido text not null,
  created_at timestamptz not null default now()
);

create table public.saludsexual_revisiones (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  proxima_fecha date not null,
  tipo_revision text,
  estudios_agrupados boolean not null default false,
  usuarios_asignados uuid[] not null,
  completada boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── 4. Módulo: Proyectos ──────────────────────────────────────────────────

create table public.proyectos (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  nombre text not null,
  descripcion text,
  meta_ahorro numeric,
  ahorro_actual numeric not null default 0,
  fecha_objetivo date,
  estado text not null default 'activo' check (estado in ('activo','pausado','completado','cancelado')),
  created_at timestamptz not null default now()
);

create table public.proyecto_seguimientos (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references public.proyectos(id) on delete cascade,
  fecha date not null,
  autor_id uuid not null references public.users(id) on delete cascade,
  contenido text not null,
  created_at timestamptz not null default now()
);

-- ─── 4. Módulo: Viajes ─────────────────────────────────────────────────────

create table public.viajes_wishlist (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  nombre text not null,
  descripcion text,
  imagen_url text,
  tipo text check (tipo in ('viaje','evento')),
  agregado_por uuid references public.users(id) on delete set null,
  interes_user_a integer check (interes_user_a between 1 and 5),
  interes_user_b integer check (interes_user_b between 1 and 5),
  created_at timestamptz not null default now()
);

create table public.viajes_eventos (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  nombre text not null,
  presupuesto numeric,
  fecha_inicio date,
  fecha_fin date,
  caracteristicas text,
  revisiones text,
  created_at timestamptz not null default now()
);

-- ─── 4. Módulo: Fechas clave ───────────────────────────────────────────────

create table public.fechas_clave (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  titulo text not null,
  fecha date not null,
  hora time,
  descripcion text,
  icono text,
  recurrencia jsonb,
  created_at timestamptz not null default now()
);

create index idx_fechas_clave_couple on public.fechas_clave(couple_id, fecha);

-- ─── 5. Salud emocional: Checkins ──────────────────────────────────────────
-- v1.2 · incluye partner-rating (energía + estrés percibidos)

create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  week_of date not null, -- lunes de la semana reflexionada

  -- Self-checkin (PRD v1.0 §6.8)
  estado_animo text check (estado_animo in ('feliz','triste','neutral','agotado')),
  energia integer check (energia between 1 and 10),
  deseo integer check (deseo between 1 and 10),
  presion_trabajo text check (presion_trabajo in ('baja','mediana','alta','extrema')),
  comentarios text,

  -- Partner-rating (v1.2 · §10)
  partner_energia_percibida integer check (partner_energia_percibida between 1 and 10),
  partner_estres_percibido text check (partner_estres_percibido in ('baja','mediana','alta','extrema')),

  submitted_at timestamptz not null default now(),
  unique(couple_id, user_id, week_of)
);

create index idx_checkins_user_week on public.checkins(user_id, week_of desc);
create index idx_checkins_couple_week on public.checkins(couple_id, week_of desc);

create table public.checkin_comentarios (
  id uuid primary key default gen_random_uuid(),
  checkin_id uuid not null references public.checkins(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  contenido text not null,
  created_at timestamptz not null default now()
);

-- ─── 5. Salud emocional: Mood ad-hoc (v1.2 · §11) ──────────────────────────

create table public.mood_checkins (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  emocion text not null check (emocion in (
    'carinoso','feliz','tranquilo','neutral',
    'agotado','ansioso','triste','frustrado'
  )),
  nota text,
  created_at timestamptz not null default now()
);

create index idx_mood_user_time on public.mood_checkins(user_id, created_at desc);
create index idx_mood_couple_time on public.mood_checkins(couple_id, created_at desc);

-- ─── 5. Salud emocional: Mimos ─────────────────────────────────────────────

create table public.mimos_sessions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  fecha_programada date not null,
  realizada_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.mimos (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  autor_id uuid not null references public.users(id) on delete cascade,
  destinatario_id uuid not null references public.users(id) on delete cascade,
  titulo text not null,
  descripcion text,
  imagen_url text,
  emocion_asociada text check (emocion_asociada in (
    'gratitud','ternura','admiracion','orgullo','diversion','deseo','paz'
  )),
  revealed_in_session_id uuid references public.mimos_sessions(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_mimos_couple on public.mimos(couple_id, created_at desc);

create table public.mimo_reacciones (
  id uuid primary key default gen_random_uuid(),
  mimo_id uuid not null references public.mimos(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  contenido text not null,
  created_at timestamptz not null default now()
);

-- ─── 6. Conversación: Acuerdos ─────────────────────────────────────────────

create table public.acuerdos (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  nombre text not null,
  descripcion text,
  categoria text check (categoria in ('comunicacion','dinero','familia','tiempo','intimidad','hogar','otros')),
  creado_por uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.acuerdo_comentarios (
  id uuid primary key default gen_random_uuid(),
  acuerdo_id uuid not null references public.acuerdos(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  contenido text not null,
  created_at timestamptz not null default now()
);

create table public.claude_consultas (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  escenario text not null,
  verdict text check (verdict in ('no_concern','talk_first','violation','ambiguous')),
  respuesta jsonb, -- structured output con acuerdos relevantes + recomendación
  created_at timestamptz not null default now()
);

-- ─── 6. Conversación: Discusiones ──────────────────────────────────────────

create table public.discusiones (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  nombre_evento text not null,
  fecha date,
  resumen text,
  contexto_causante text,
  que_aprendimos text,
  tema_relacionado_id uuid,
  creado_por uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.acuerdo_discusion_links (
  acuerdo_id uuid not null references public.acuerdos(id) on delete cascade,
  discusion_id uuid not null references public.discusiones(id) on delete cascade,
  primary key (acuerdo_id, discusion_id)
);

-- ─── 6. Conversación: Temas ────────────────────────────────────────────────

create table public.temas (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  nombre_tema text not null,
  resumen text,
  acuerdo_resuelto_id uuid references public.acuerdos(id) on delete set null,
  estado text not null default 'abierto' check (estado in ('abierto','en_discusion','resuelto','archivado')),
  created_at timestamptz not null default now()
);

create table public.tema_timeline_entries (
  id uuid primary key default gen_random_uuid(),
  tema_id uuid not null references public.temas(id) on delete cascade,
  fecha timestamptz not null default now(),
  tipo text not null check (tipo in ('discusion','comentario','avance')),
  referencia_id uuid,
  autor_id uuid references public.users(id) on delete set null,
  contenido text
);

-- FK delayed para temas → discusiones (circular)
alter table public.discusiones
  add constraint discusiones_tema_fk
  foreign key (tema_relacionado_id) references public.temas(id) on delete set null;

-- ─── 7. Pagos (rename de gastos · v1.1) ────────────────────────────────────

create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  nombre text not null,
  monto numeric not null,
  categoria text check (categoria in ('vivienda','servicios','suscripciones','transporte','otros')),
  pagador_asignado uuid references public.users(id) on delete set null,
  recurrencia jsonb, -- { value: int, unit: ... }
  due_date date,
  pagado boolean not null default false,
  pagado_en timestamptz,
  created_at timestamptz not null default now()
);

create index idx_pagos_couple_due on public.pagos(couple_id, due_date) where pagado = false;

-- ─── 7. Mantenimiento ──────────────────────────────────────────────────────
-- Vive como accionables tipo='mantenimiento'. Tabla helper para metadata extra:

create table public.mantenimiento_items (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  nombre text not null,
  descripcion text,
  recurrencia jsonb,
  created_at timestamptz not null default now()
);

-- ─── 8. Sistema: Notificaciones ────────────────────────────────────────────

create table public.notification_events (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  tipo text not null, -- ej: 'monday_digest', 'cita_consenso', 'fecha_clave_proxima'
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notif_user_read on public.notification_events(user_id, read_at, created_at desc);
create index idx_notif_couple on public.notification_events(couple_id, created_at desc);

-- ─── 8. Sistema: Resumen mensual ───────────────────────────────────────────

create table public.monthly_summaries (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  month_of date not null, -- primer día del mes resumido
  narrativa_conexion text,
  narrativa_conflicto text,
  narrativa_logistica text,
  narrativa_intimidad text,
  stats jsonb,
  generated_at timestamptz not null default now(),
  unique(couple_id, month_of)
);

-- ─── 9. Triggers ───────────────────────────────────────────────────────────

-- 9.1 Crear row en public.users cuando se crea un auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 9.2 Si hay invitación pendiente para este email, bind al couple
create or replace function public.bind_invitation_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  inv record;
begin
  -- Busca invitación pendiente más reciente para este email
  select * into inv
  from public.invitations
  where email = new.email
    and accepted_at is null
    and expires_at > now()
  order by created_at desc
  limit 1;

  if inv is not null then
    update public.couples
    set user_b_id = new.id,
        updated_at = now()
    where id = inv.couple_id
      and user_b_id is null;

    update public.invitations
    set accepted_at = now()
    where id = inv.id;
  end if;

  return new;
end;
$$;

create trigger on_user_created_bind_invite
after insert on public.users
for each row execute function public.bind_invitation_on_signup();

-- 9.3 Regenerar accionable recurrente al completar
create or replace function public.regenerate_recurring_accionable()
returns trigger
language plpgsql
as $$
declare
  next_due date;
  unit text;
  val integer;
begin
  -- Solo si pasamos de "no completado" a "completado" y tiene recurrencia
  if old.completado_at is null
     and new.completado_at is not null
     and new.recurrencia is not null
     and new.due_date is not null then

    val := (new.recurrencia->>'value')::integer;
    unit := new.recurrencia->>'unit';

    next_due := case unit
      when 'days' then new.due_date + (val || ' days')::interval
      when 'weeks' then new.due_date + (val || ' weeks')::interval
      when 'months' then new.due_date + (val || ' months')::interval
      when 'years' then new.due_date + (val || ' years')::interval
      else null
    end;

    if next_due is not null then
      insert into public.accionables (
        couple_id, titulo, descripcion, tipo, due_date, asignado_user_id,
        parent_pago_id, parent_proyecto_id, parent_mantenimiento_id,
        parent_viaje_id, parent_discusion_id, parent_revision_id,
        recurrencia
      ) values (
        new.couple_id, new.titulo, new.descripcion, new.tipo, next_due, new.asignado_user_id,
        new.parent_pago_id, new.parent_proyecto_id, new.parent_mantenimiento_id,
        new.parent_viaje_id, new.parent_discusion_id, new.parent_revision_id,
        new.recurrencia
      );
    end if;
  end if;

  return new;
end;
$$;

create trigger on_accionable_completed_regenerate
after update on public.accionables
for each row execute function public.regenerate_recurring_accionable();

-- 9.4 Updated_at automático
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger couples_set_updated_at before update on public.couples for each row execute function public.set_updated_at();
create trigger accionables_set_updated_at before update on public.accionables for each row execute function public.set_updated_at();

-- ─── 10. Row Level Security ────────────────────────────────────────────────

-- Habilitar RLS en todas las tablas
alter table public.users enable row level security;
alter table public.couples enable row level security;
alter table public.invitations enable row level security;
alter table public.accionables enable row level security;
alter table public.citas_ideas enable row level security;
alter table public.citas_propuestas enable row level security;
alter table public.citas_eventos enable row level security;
alter table public.saludsexual_eventos enable row level security;
alter table public.saludsexual_comentarios enable row level security;
alter table public.saludsexual_revisiones enable row level security;
alter table public.proyectos enable row level security;
alter table public.proyecto_seguimientos enable row level security;
alter table public.viajes_wishlist enable row level security;
alter table public.viajes_eventos enable row level security;
alter table public.fechas_clave enable row level security;
alter table public.checkins enable row level security;
alter table public.checkin_comentarios enable row level security;
alter table public.mood_checkins enable row level security;
alter table public.mimos_sessions enable row level security;
alter table public.mimos enable row level security;
alter table public.mimo_reacciones enable row level security;
alter table public.acuerdos enable row level security;
alter table public.acuerdo_comentarios enable row level security;
alter table public.claude_consultas enable row level security;
alter table public.discusiones enable row level security;
alter table public.acuerdo_discusion_links enable row level security;
alter table public.temas enable row level security;
alter table public.tema_timeline_entries enable row level security;
alter table public.pagos enable row level security;
alter table public.mantenimiento_items enable row level security;
alter table public.notification_events enable row level security;
alter table public.monthly_summaries enable row level security;

-- ── Users: ver y editar el propio
create policy "users_select_self_and_partner" on public.users for select
  using (
    id = auth.uid()
    or id in (
      select user_a_id from public.couples where user_b_id = auth.uid()
      union
      select user_b_id from public.couples where user_a_id = auth.uid()
    )
  );

create policy "users_update_self" on public.users for update
  using (id = auth.uid());

-- ── Couples: solo miembros
create policy "couples_select_members" on public.couples for select
  using (user_a_id = auth.uid() or user_b_id = auth.uid());

create policy "couples_insert_self" on public.couples for insert
  with check (user_a_id = auth.uid());

create policy "couples_update_members" on public.couples for update
  using (user_a_id = auth.uid() or user_b_id = auth.uid());

-- ── Invitations: el que invitó puede ver
create policy "invitations_select_inviter" on public.invitations for select
  using (invited_by = auth.uid());

create policy "invitations_insert_member" on public.invitations for insert
  with check (
    couple_id in (
      select id from public.couples where user_a_id = auth.uid() or user_b_id = auth.uid()
    )
    and invited_by = auth.uid()
  );

-- ── Generic couple-scoped policy generator
-- Aplicado a todas las tablas con couple_id:

do $$
declare
  tbl text;
  couple_tables text[] := array[
    'accionables','citas_ideas','citas_propuestas','citas_eventos',
    'saludsexual_eventos','saludsexual_revisiones',
    'proyectos','viajes_wishlist','viajes_eventos','fechas_clave',
    'checkins','mood_checkins','mimos_sessions','mimos',
    'acuerdos','claude_consultas','discusiones','temas',
    'pagos','mantenimiento_items','notification_events','monthly_summaries'
  ];
begin
  foreach tbl in array couple_tables loop
    execute format($f$
      create policy "%I_couple_all" on public.%I
      for all using (
        couple_id in (
          select id from public.couples
          where user_a_id = auth.uid() or user_b_id = auth.uid()
        )
      ) with check (
        couple_id in (
          select id from public.couples
          where user_a_id = auth.uid() or user_b_id = auth.uid()
        )
      );
    $f$, tbl, tbl);
  end loop;
end $$;

-- ── Child tables sin couple_id directo: validar vía parent

create policy "saludsexual_comentarios_via_evento" on public.saludsexual_comentarios for all
  using (evento_id in (
    select id from public.saludsexual_eventos
    where couple_id in (
      select id from public.couples where user_a_id = auth.uid() or user_b_id = auth.uid()
    )
  ))
  with check (user_id = auth.uid());

create policy "proyecto_seguimientos_via_proyecto" on public.proyecto_seguimientos for all
  using (proyecto_id in (
    select id from public.proyectos
    where couple_id in (
      select id from public.couples where user_a_id = auth.uid() or user_b_id = auth.uid()
    )
  ))
  with check (autor_id = auth.uid());

create policy "checkin_comentarios_via_checkin" on public.checkin_comentarios for all
  using (checkin_id in (
    select id from public.checkins
    where couple_id in (
      select id from public.couples where user_a_id = auth.uid() or user_b_id = auth.uid()
    )
  ))
  with check (user_id = auth.uid());

create policy "mimo_reacciones_via_mimo" on public.mimo_reacciones for all
  using (mimo_id in (
    select id from public.mimos
    where couple_id in (
      select id from public.couples where user_a_id = auth.uid() or user_b_id = auth.uid()
    )
  ))
  with check (user_id = auth.uid());

create policy "acuerdo_comentarios_via_acuerdo" on public.acuerdo_comentarios for all
  using (acuerdo_id in (
    select id from public.acuerdos
    where couple_id in (
      select id from public.couples where user_a_id = auth.uid() or user_b_id = auth.uid()
    )
  ))
  with check (user_id = auth.uid());

create policy "acuerdo_discusion_links_couple" on public.acuerdo_discusion_links for all
  using (acuerdo_id in (
    select id from public.acuerdos
    where couple_id in (
      select id from public.couples where user_a_id = auth.uid() or user_b_id = auth.uid()
    )
  ));

create policy "tema_timeline_via_tema" on public.tema_timeline_entries for all
  using (tema_id in (
    select id from public.temas
    where couple_id in (
      select id from public.couples where user_a_id = auth.uid() or user_b_id = auth.uid()
    )
  ));

-- ── Realtime publication: enable para tablas con realtime relevante
alter publication supabase_realtime add table public.mood_checkins;
alter publication supabase_realtime add table public.notification_events;
alter publication supabase_realtime add table public.citas_propuestas;
alter publication supabase_realtime add table public.mimos;
alter publication supabase_realtime add table public.acuerdo_comentarios;
