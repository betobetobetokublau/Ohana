-- ════════════════════════════════════════════════════════════════════════════
-- Ohana · Phase 4 additions
-- ════════════════════════════════════════════════════════════════════════════
-- Cambios:
--   1. Avatar (emoji + bg color) en users
--   2. Pagos · soporte de monto variable (variable amount)
--   3. Temas · priority field
--   4. Acuerdos · versioning (snapshots)
--   5. Temas-acuerdos · many-to-many (en lugar de FK directa)
--   6. Invitaciones temporales con password
-- ════════════════════════════════════════════════════════════════════════════

-- ─── 1. Avatar (emoji + bg color) en users ─────────────────────────────────

alter table public.users
  add column if not exists avatar_emoji text default '😀',
  add column if not exists avatar_color text default '#E8B89F'; -- accent-soft default

-- ─── 2. Pagos variable amount ──────────────────────────────────────────────

alter table public.pagos
  add column if not exists monto_variable boolean not null default false;

-- Tabla histórica de instancias de pagos variables · cada renta/cuenta tiene
-- su propio monto concreto. El `monto` del pago padre queda como referencia.
create table if not exists public.pago_instancias (
  id uuid primary key default gen_random_uuid(),
  pago_id uuid not null references public.pagos(id) on delete cascade,
  monto numeric not null,
  due_date date,
  pagado_en timestamptz not null default now(),
  pagado_por uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_pago_instancias_pago on public.pago_instancias(pago_id, pagado_en desc);

alter table public.pago_instancias enable row level security;

create policy "pago_instancias_via_pago" on public.pago_instancias for all
  using (pago_id in (
    select id from public.pagos
    where couple_id in (
      select id from public.couples where user_a_id = auth.uid() or user_b_id = auth.uid()
    )
  ));

-- ─── 3. Temas priority ─────────────────────────────────────────────────────

alter table public.temas
  add column if not exists prioridad text default 'media'
    check (prioridad in ('baja', 'media', 'alta', 'urgente'));

-- ─── 4. Acuerdos versioning ────────────────────────────────────────────────

create table if not exists public.acuerdo_versiones (
  id uuid primary key default gen_random_uuid(),
  acuerdo_id uuid not null references public.acuerdos(id) on delete cascade,
  version_num integer not null,
  nombre text not null,
  descripcion text,
  categoria text,
  cambiado_por uuid references public.users(id) on delete set null,
  cambios_resumen text, -- ej "renombrado + descripción ampliada"
  created_at timestamptz not null default now(),
  unique (acuerdo_id, version_num)
);

create index if not exists idx_acuerdo_versiones_acuerdo on public.acuerdo_versiones(acuerdo_id, version_num desc);

alter table public.acuerdo_versiones enable row level security;

create policy "acuerdo_versiones_via_acuerdo" on public.acuerdo_versiones for all
  using (acuerdo_id in (
    select id from public.acuerdos
    where couple_id in (
      select id from public.couples where user_a_id = auth.uid() or user_b_id = auth.uid()
    )
  ));

-- Trigger: cuando se crea un acuerdo, guardamos v1
-- Cuando se actualiza nombre/descripcion/categoria, guardamos vN+1
create or replace function public.snapshot_acuerdo()
returns trigger
language plpgsql
as $$
declare
  next_version integer;
begin
  if tg_op = 'INSERT' then
    insert into public.acuerdo_versiones (acuerdo_id, version_num, nombre, descripcion, categoria, cambiado_por, cambios_resumen)
    values (new.id, 1, new.nombre, new.descripcion, new.categoria, new.creado_por, 'Creación inicial');
    return new;
  end if;

  -- UPDATE: solo si hubo cambio en algun campo versionable
  if tg_op = 'UPDATE' and (
    old.nombre is distinct from new.nombre or
    old.descripcion is distinct from new.descripcion or
    old.categoria is distinct from new.categoria
  ) then
    select coalesce(max(version_num), 0) + 1 into next_version
    from public.acuerdo_versiones
    where acuerdo_id = new.id;

    insert into public.acuerdo_versiones (acuerdo_id, version_num, nombre, descripcion, categoria, cambios_resumen)
    values (new.id, next_version, new.nombre, new.descripcion, new.categoria,
      case
        when old.nombre is distinct from new.nombre and old.descripcion is distinct from new.descripcion then 'Cambio de nombre y descripción'
        when old.nombre is distinct from new.nombre then 'Cambio de nombre'
        when old.descripcion is distinct from new.descripcion then 'Cambio de descripción'
        when old.categoria is distinct from new.categoria then 'Cambio de categoría'
        else 'Actualización'
      end
    );
  end if;
  return new;
end;
$$;

drop trigger if exists snapshot_acuerdo_trigger on public.acuerdos;
create trigger snapshot_acuerdo_trigger
after insert or update on public.acuerdos
for each row execute function public.snapshot_acuerdo();

-- ─── 5. Tema · acuerdo many-to-many ────────────────────────────────────────
-- La FK acuerdo_resuelto_id en temas la mantenemos por backwards compat (legacy)
-- pero ahora la fuente de verdad es esta tabla M:M.

create table if not exists public.tema_acuerdo_links (
  tema_id uuid not null references public.temas(id) on delete cascade,
  acuerdo_id uuid not null references public.acuerdos(id) on delete cascade,
  vinculado_por uuid references public.users(id) on delete set null,
  vinculado_at timestamptz not null default now(),
  primary key (tema_id, acuerdo_id)
);

create index if not exists idx_tema_acuerdo_tema on public.tema_acuerdo_links(tema_id);
create index if not exists idx_tema_acuerdo_acuerdo on public.tema_acuerdo_links(acuerdo_id);

alter table public.tema_acuerdo_links enable row level security;

create policy "tema_acuerdo_links_via_tema" on public.tema_acuerdo_links for all
  using (tema_id in (
    select id from public.temas
    where couple_id in (
      select id from public.couples where user_a_id = auth.uid() or user_b_id = auth.uid()
    )
  ));

-- Backfill: temas con acuerdo_resuelto_id → crear link
insert into public.tema_acuerdo_links (tema_id, acuerdo_id)
select id, acuerdo_resuelto_id from public.temas
where acuerdo_resuelto_id is not null
on conflict do nothing;

-- ─── 6. Invitaciones con password temporal ─────────────────────────────────
-- Alternativa al magic-link · útil cuando el partner no tiene email accesible
-- o prefiere recibir una credencial directa.

alter table public.invitations
  add column if not exists temp_password_hash text,
  add column if not exists must_change_password boolean not null default false;

-- Marker per-user de "necesito cambiar mi password en el próximo login"
alter table public.users
  add column if not exists must_change_password boolean not null default false;

-- ════════════════════════════════════════════════════════════════════════════
-- Realtime publications · agregar nuevas tablas
-- ════════════════════════════════════════════════════════════════════════════

alter publication supabase_realtime add table public.acuerdo_versiones;
alter publication supabase_realtime add table public.tema_acuerdo_links;
alter publication supabase_realtime add table public.pago_instancias;
