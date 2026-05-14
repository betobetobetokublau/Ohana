# Ohana

Plataforma para parejas · Next.js 14 + Supabase + Vercel.

Spanish UI, Mexican context. Mobile capture / iPad + web consumption. PWA en móvil.

Sigue [`../PRD.md`](../PRD.md) v1.2 como fuente autoritativa.

## Stack

- **Frontend:** Next.js 14 App Router · TypeScript strict · Tailwind CSS · Radix primitives · Framer Motion
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime + RLS)
- **Hosting:** Vercel
- **Email:** Postmark (Phase 4)
- **AI:** Claude API (`@anthropic-ai/sdk`)
- **Package manager:** bun (también funciona con npm/pnpm)

## Setup local

### 1. Instalar dependencias

```bash
cd app/
bun install
```

### 2. Crear proyecto Supabase

1. Crea un proyecto nuevo en [supabase.com](https://supabase.com).
2. Copia las keys desde **Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
3. Copia las connection strings desde **Settings → Database → Connection string**:
   - **Transaction mode** (pooler, port 6543) → `DATABASE_URL`
   - **Direct connection** (port 5432) → `DIRECT_URL`

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
# luego edita .env.local con los valores reales
```

### 4. Aplicar migrations

Opción A · Supabase CLI (recomendado):

```bash
bunx supabase link --project-ref <tu-project-ref>
bunx supabase db push
```

Opción B · Pegar el SQL directo:

1. Abre Supabase Studio → **SQL Editor**.
2. Pega el contenido de `supabase/migrations/00000000000001_init.sql`.
3. Run.

### 5. Generar tipos TypeScript (opcional pero recomendado)

```bash
bun run db:types
```

Esto reemplaza `src/types/database.ts` con los tipos exactos generados desde tu schema.

### 6. Arrancar dev server

```bash
bun dev
```

Abre [http://localhost:3000](http://localhost:3000). El middleware te manda a `/login`.

## Deploy a Vercel

### 1. Push a GitHub

```bash
git init
git add .
git commit -m "init Ohana"
git remote add origin <tu-repo>
git push -u origin main
```

### 2. Import en Vercel

1. [vercel.com](https://vercel.com) → New Project → import el repo.
2. **Root Directory:** `app/` (porque el repo tiene PRD/DESIGN/mockup en la raíz).
3. Framework: Next.js (auto-detectado).
4. **Environment Variables:** copia todo lo de `.env.local` (excepto `NEXT_PUBLIC_APP_URL`, que se setea automático).
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL` (el pooler, port 6543)
   - `DIRECT_URL`
   - `ANTHROPIC_API_KEY`
   - `POSTMARK_API_TOKEN`
   - `POSTMARK_FROM_EMAIL`
   - `CRON_SECRET` (un random string)
5. Deploy.

### 3. Actualizar redirect URLs en Supabase

Una vez que tengas tu URL de Vercel:

- Supabase **Authentication → URL Configuration**:
  - **Site URL:** `https://tu-app.vercel.app`
  - **Redirect URLs:** agrega `https://tu-app.vercel.app/auth/callback`

### 4. Iconos PWA

Antes del deploy: genera los iconos siguiendo [`public/icons/README.md`](public/icons/README.md). Sin ellos la PWA no se instala correctamente.

## Estructura

```
app/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (app)/          # Rutas autenticadas con shell
│   │   │   ├── hoy/        # ✅ Implementado
│   │   │   ├── mood/       # ✅ Implementado
│   │   │   ├── checkin/    # ✅ Implementado
│   │   │   ├── capturar/   # ✅ Implementado
│   │   │   ├── notificaciones/  # ✅ Implementado
│   │   │   ├── pendientes/ # ✅ Implementado
│   │   │   ├── ajustes/    # ✅ Implementado
│   │   │   └── [otros]/    # 🚧 Stubs · pendientes
│   │   ├── login/          # Magic-link auth
│   │   ├── auth/           # Callback + signout
│   │   ├── onboarding/     # Crear espacio + invitar
│   │   └── layout.tsx      # Root: fonts, PWA
│   ├── components/
│   │   ├── ui/             # Primitives (button, card, etc.)
│   │   ├── shell/          # Topbar, sidebar, bottom-nav, app-shell
│   │   ├── mood/           # Sparkline, heatmap, quick-capture, capture-full
│   │   └── shared/         # ModuleStub
│   ├── lib/
│   │   ├── supabase/       # client, server, middleware
│   │   └── utils/          # cn, dates, mood, nav
│   └── types/database.ts   # Stub manual · regenera con `bun run db:types`
├── supabase/
│   ├── config.toml
│   └── migrations/         # Schema PRD v1.2 completo
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js               # Service worker (sin push, sin background sync)
│   └── icons/              # Pendiente generar
├── middleware.ts           # Auth guard + redirects
├── package.json
├── tailwind.config.ts
├── next.config.mjs
└── tsconfig.json
```

## Qué está hecho · qué falta

**Hecho (Phase 1 foundation):**

- ✅ Auth flow con magic-links
- ✅ Onboarding completo (crear espacio + invitar pareja)
- ✅ Schema completo PRD v1.2 con RLS, triggers, realtime publication
- ✅ App shell responsive (sidebar web/iPad con hamburguesa, bottom nav móvil)
- ✅ Hoy module con sparkline de mood y quick capture
- ✅ Mood ad-hoc completo (8 emojis curados, heatmap 8 semanas, captura full + bottom-sheet)
- ✅ Checkin semanal 2 pasos (self + partner-rating) con comparativa post-revelación
- ✅ Capturar launcher con todas las opciones
- ✅ Mis pendientes
- ✅ Notificaciones (inbox basic)
- ✅ Ajustes / perfil
- ✅ PWA manifest + service worker (install + offline shell)

**Pendiente (siguientes sesiones):**

- 🚧 Citas completo (suggest engine + voting + ratings + ideas library)
- 🚧 Mimos completo (capture + session reveal con animation + archive)
- 🚧 Acuerdos + Pregúntale a Claude
- 🚧 Discusiones + Temas (con timeline)
- 🚧 Pagos · Mantenimiento · Proyectos · Viajes · Salud sexual · Fechas clave
- 🚧 Calendario (grid mensual + side panel con checkbox de agrupación)
- 🚧 Resumen mensual (Claude integration)
- 🚧 Monday digest cron (Vercel Cron + Postmark)
- 🚧 Realtime subscriptions (mood, notifications, cita votes)
- 🚧 Pregúntale a Claude API route con búsqueda semántica

## Comandos útiles

```bash
bun dev               # Dev server
bun run build         # Build production
bun run typecheck     # tsc --noEmit
bun run lint          # ESLint
bun run db:types      # Regenerar types desde schema
bun run db:reset      # Reset DB local (CLI Supabase)
bun run db:push       # Push migrations al proyecto remoto
```

## Notas

- **Magic-link emails:** Supabase usa su servicio por default. Para usar Postmark, ve a Supabase → Authentication → Email Templates y configura SMTP de Postmark. Está documentado en [Supabase SMTP docs](https://supabase.com/docs/guides/auth/auth-smtp).
- **Pooler vs Direct:** `DATABASE_URL` (transaction pooler, port 6543) es lo que usan las serverless functions de Vercel. `DIRECT_URL` (port 5432) lo usa Supabase CLI para migrations. Las dos las necesitas.
- **Service worker:** solo se registra en production. En dev no se activa para evitar caché stale.
- **RLS:** todas las queries del client SDK respetan RLS automáticamente. Si necesitas bypass (cron, webhook), usa `createServiceRoleClient()` desde `lib/supabase/server.ts`.
