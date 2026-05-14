# Ohana

Plataforma para parejas. Spanish UI, Mexican context. Mobile capture / iPad + web consumption.

## Source of truth
- `PRD.md` — **Product Requirements Document v1.2 (autoritativo).** Captura las decisiones tomadas durante design consultation (v1.1, 2026-05-07) y la iteración de checkin + mood ad-hoc (v1.2, 2026-05-11). Lee este primero.
- `relationship_platform_prd.md` (entregado por el usuario, vive en `~/Downloads/`) — PRD v1.0 base. Sigue siendo referencia para schemas, AI prompts, RLS, fases — todo lo no tocado en v1.1.
- `DESIGN.md` — Sistema de diseño completo. **Léelo antes de cualquier decisión visual.**
- `mockup.html` — 27 pantallas de referencia, dirección Domestic Modernism aprobada.

## Design System
Siempre lee `DESIGN.md` antes de hacer decisiones de UI o visuales.
Toda elección de fuente, color, spacing, y dirección estética está definida ahí.
No te desvíes sin aprobación explícita del usuario.
En modo QA, marca cualquier código que no respete `DESIGN.md`.

## Stack (recomendado por el PRD §12)
- Next.js 14+ App Router · TypeScript · Tailwind · shadcn/ui
- Supabase (PostgreSQL + Auth + Storage + Realtime + Edge Functions)
- Vercel hosting
- Postmark email con magic-link
- Claude API (Sonnet routine, Opus para Resumen mensual)

## Estado actual
- 2026-05-07 — Proyecto inicializado. Dirección visual lockeada (Domestic Modernism). 27 pantallas mockeadas. PWA en móvil agregada al spec.
- 2026-05-11 — Agregado al PRD v1.2: paso 2 partner-rating en checkin, módulo Mood ad-hoc, expansión Claude de 5 a 7 puntos.
- 2026-05-11 — **Scaffold Phase 1 listo en `app/`**. Next.js 14 + Supabase + PWA. Auth + onboarding + app shell + Hoy + Mood + Checkin (2 pasos) + Capturar + Mis pendientes + Notificaciones + Ajustes funcionales. Resto de módulos como stubs navegables. Schema completo del PRD v1.2 en una migration con RLS + triggers + realtime publication.

## Cómo seguir
1. Configurar Supabase (crear proyecto, copiar keys al `.env.local` siguiendo `app/README.md`)
2. Aplicar la migration: `bunx supabase db push` o pegar el SQL en Studio
3. `bun install && bun dev` desde `app/`
4. Crear cuenta, espacio, e invitar pareja
5. Vercel deploy cuando esté listo

## Pendiente (siguientes sesiones)
- Citas completo · Mimos completo · Pregúntale a Claude · Resumen mensual con AI · Cron jobs (Monday digest, Resumen mensual cron) · Realtime subscriptions · Postmark email worker
