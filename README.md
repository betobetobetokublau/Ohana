# Ohana

Plataforma para parejas. Maneja la dimensión operativa (citas, mantenimiento, pagos, viajes) y emocional (checkins, acuerdos, mimos, discusiones) de la vida compartida. Spanish UI, Mexican context.

**No es una app de productividad. Es una app de intencionalidad.**

---

## Estructura del repo

```
.
├── PRD.md                            ← Product Requirements v1.2 (autoritativo)
├── DESIGN.md                         ← Sistema de diseño Domestic Modernism
├── CLAUDE.md                         ← Instrucciones para sesiones con Claude
├── mockup.html                       ← 27 pantallas canónicas (HTML estático)
├── proposal-*.html                   ← 4 propuestas visuales de la consultoría
└── app/                              ← Aplicación Next.js 14 + Supabase
    ├── README.md                     ← Setup paso a paso
    ├── src/                          ← Código fuente
    ├── supabase/migrations/          ← Schema completo PRD v1.2
    ├── public/                       ← PWA manifest + service worker
    └── ...
```

## Stack

- **Frontend:** Next.js 14 App Router · TypeScript · Tailwind · Radix · Framer Motion
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime + RLS)
- **Hosting:** Vercel (Root Directory: `app/`)
- **PWA:** instalable en móvil con persistencia local (sin push, sin background sync)
- **AI:** Claude API (`@anthropic-ai/sdk`)
- **Email:** Postmark (Phase 4)

## Setup rápido

```bash
cd app/
bun install
cp .env.example .env.local      # llenar con tus keys de Supabase
bunx supabase link --project-ref <tu-ref>
bunx supabase db push
bun dev
```

Setup completo en [`app/README.md`](app/README.md).

## Documentación

- [**PRD v1.2**](PRD.md) — qué hace el producto, decisiones tomadas, schema, fases.
- [**DESIGN.md**](DESIGN.md) — sistema visual: tipografía, color, layout, motion, component decisions.
- [**mockup.html**](mockup.html) — 27 pantallas mockeadas en HTML estático. Abre en cualquier browser.

## Estado

- ✅ **Phase 1 foundation:** auth + onboarding + app shell + Hoy + Mood ad-hoc + Checkin (2 pasos) + Capturar + Pendientes + Notificaciones + Ajustes + PWA
- 🚧 **Phase 2-4:** Citas completo · Mimos session · Acuerdos + Pregúntale a Claude · Discusiones · Temas · Logística (Pagos, Mantenimiento, Proyectos, Viajes, Salud sexual, Fechas clave) · Calendario · Resumen mensual · cron jobs · realtime · Postmark
