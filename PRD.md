# Product Requirements Document — v1.2

**Producto:** Ohana
**Working name:** Ohana
**Versión:** 1.2 (delta sobre v1.0 del 2026-05)
**Fecha:** 2026-05-11
**Owner:** Alberto
**Idioma del producto:** español (mexicano). Nombres de módulos en español. Código en inglés.

---

## 0. Sobre este documento

Este PRD v1.2 es la fuente autoritativa actualizada. **Reemplaza a v1.0** (`relationship_platform_prd.md`, mayo 2026) en las áreas tocadas abajo. Todo lo no mencionado aquí se mantiene tal como en v1.0 — schemas, AI prompts, RLS policies, fases de implementación, cadencias.

Cambios capturados aquí:
- **v1.1:** decisiones abiertas resueltas, web como 3ra superficie, PWA en móvil, navegación primaria, inventario de pantallas, módulos Hoy/Capturar, comportamiento del side-panel del calendario, centro de notificaciones, component patterns cross-feature.
- **v1.2 (nuevo):** paso 2 de partner-rating en el checkin semanal (energía + estrés percibidos), módulo Mood ad-hoc con captura ilimitada y 8 emojis curados, expansión de Claude de 5 a 7 puntos de integración.

Para el sistema visual completo: ver [`DESIGN.md`](DESIGN.md).
Para referencia visual canónica de las 27 pantallas: ver [`mockup.html`](mockup.html).

---

## 1. Decisiones abiertas resueltas

Las decisiones marcadas como pendientes en §11 de v1.0 quedan resueltas como sigue:

| # | Decisión | Resolución | Notas |
|---|----------|------------|-------|
| 1 | "hump" mood enum value | **Reemplazar por `agotado`** | Cuatro valores finales: `feliz \| triste \| neutral \| agotado`. `ansioso` queda como alternativa si user testing lo justifica. |
| 2 | Gastos scope — deadline-only o full money tracking | **Renombrar módulo a "Pagos" y v1 incluye monto** | Schema v2 del PRD original adelantado a v1: `monto`, `categoria`, `pagador_asignado`, `pagado`. La etiqueta "Gastos" desaparece del producto. |
| 3 | Eventos vs Salidas en SaludSexual | **Evento = en casa / Salida = fuera de casa** | Definición confirmada como help-text en el formulario. |
| 4 | Mimos visibility — surprise o ambient | **Surprise (sorpresa)** | Mimos privados al autor hasta la sesión mensual. La sesión mantiene su peso ritual. |
| 5 | Mimos session — in-person o remote | **In-person, mismo iPad** | Configurable en futuro pero v1 asume reunión presencial. |
| 6 | Discusiones — single shared o per-perspective | **Single shared en v1** | Per-perspective queda en v2 (PRD original §6.11.2). |
| 7 | Cita suggestion algorithm | **Stratified pick (winner / gem / wildcard)** | Confirmado. Implementación per §6.1.2 de v1.0. |
| 8 | Recurrencia field type | **JSONB `{value, unit}`** | Confirmado. Trigger Supabase regenera próxima ocurrencia al marcar completado. |

---

## 2. Superficies de uso (actualizado)

v1.0 contemplaba dos superficies (móvil capture + iPad consumption). v1.1 añade web como tercera.

### 2.1 Móvil — captura primaria

Sin cambio respecto a v1.0. Forms single-screen, tap targets ≥44pt, voice input en campos de texto largo, camera shortcut para fotos de mimos y wishlist.

### 2.2 iPad — consumo primario

Sin cambio respecto a v1.0. Layouts editoriales, calendario con side-panel, Resumen mensual con tipografía magazine, Mimos session en pantalla compartida.

### 2.3 Web — consumo + admin (NUEVO)

Tercera superficie agregada en v1.1. La web es el equivalente desktop del iPad para usuarios que prefieren trabajar desde su laptop.

- **Navegación primaria:** top bar fijo full-width arriba + sidebar colapsable izquierda.
- **Top bar contiene:** botón hamburguesa (`☰`) que toggle el sidebar, brand `Ohana`, contexto de pareja (couple meta), y acciones derecha (buscar, capturar rápido, notificaciones, avatar).
- **Sidebar:** 200px expandido, 0px colapsado. Transición 220ms ease. Estado del usuario persiste por sesión (localStorage).
- **Pane principal:** todos los layouts del iPad funcionan tal cual en web (mismos componentes, mismo grid). Width útil entre 960px y 1280px.

Implementación: misma codebase Next.js, breakpoints Tailwind controlan layout móvil vs iPad/web. La diferencia móvil-vs-iPad/web es responsive; iPad-vs-web es idéntico salvo por la presencia del top bar.

### 2.4 PWA · móvil instalable (NUEVO)

En la superficie móvil, el producto se entrega como Progressive Web App. Alcance acotado: **solo los aspectos de instalación y persistencia local.** Sin push notifications, sin background sync, sin offline-first completo.

#### 2.4.1 Instalable
- Web App Manifest (`/manifest.webmanifest`) con:
  - `name`: "Ohana"
  - `short_name`: "Ohana"
  - `start_url`: `/hoy` (entry point del módulo Hoy)
  - `display`: `standalone` (sin chrome del navegador)
  - `theme_color`: `#1A1714` (ink, para la status bar en iOS/Android)
  - `background_color`: `#FBF7F2` (paper, para el splash)
  - `orientation`: `portrait-primary`
  - `icons`: set completo de tamaños iOS (`apple-touch-icon` 180×180) y Android (192×192, 512×512), maskable variants incluidas
- Meta tags requeridos en `<head>`:
  - `apple-mobile-web-app-capable: yes`
  - `apple-mobile-web-app-status-bar-style: default`
  - `apple-mobile-web-app-title: Ohana`
- Splash screens generadas para los principales viewports de iPhone (al menos: 14 Pro, 15 Pro Max, SE).
- "Add to Home Screen" prompt sutil después de la 3ra sesión activa (no en la primera visita). Banner dismissible que vive en el módulo Hoy.

#### 2.4.2 Persistencia local
Service worker (`/sw.js`) con dos responsabilidades:

1. **App shell cache** — HTML, CSS, JS, fuentes y assets estáticos cacheados en `Cache Storage`. Estrategia: `stale-while-revalidate`. Permite que la app abra instantáneamente y sin red. Si no hay red, el usuario ve la UI completa pero los datos pueden estar desactualizados.

2. **IndexedDB local** — para datos del usuario que deben sobrevivir reloads y reaperturas:
   - **Drafts de captura:** mimos, discusiones, temas, mood, ideas de cita, lugares de viaje, comentarios de acuerdos. Cualquier form que el usuario empezó pero no envió. Sobreviven cierre de app y reapertura.
   - **Preferencias UI:** estado del checkbox "agrupar por categoría" del calendario, último tab usado del bottom nav, tema (light/dark), filtros aplicados en cada módulo.
   - **Datos consultados recientes:** última versión leída del Resumen mensual, últimos 7 días de pendientes, próximos 14 días del calendario, últimos 20 mimos del archivo. Vida útil 24h, luego se invalidan en próxima sincronización con Supabase.

   Implementación recomendada: `idb` (wrapper minimalista sobre IndexedDB) o `Dexie.js`. La sesión auth de Supabase ya vive en `localStorage` por default y no requiere cambios.

#### 2.4.3 Fuera de alcance (explícito)
- **No** push notifications. Toda notificación sigue el modelo del PRD v1.0 §7: in-app via Supabase realtime + email vía Postmark. Ningún Push API.
- **No** background sync. Si el usuario captura algo offline, queda en IndexedDB como draft hasta que vuelva a tener red y abra la app — entonces se sincroniza al primer plano.
- **No** offline-first para escritura. Los forms de captura funcionan offline (escriben a IndexedDB), pero el envío real al backend espera conectividad. No hay queue con retry automático.

#### 2.4.4 Por qué este alcance
La instalabilidad da el sentimiento de "app" (icono en home screen, splash, sin chrome del navegador) sin los costos de mantener una app nativa o un workflow de App Store. La persistencia local resuelve los dos problemas concretos del PRD v1.0:
1. Drafts perdidos cuando el usuario cierra la app sin enviar.
2. Tiempo de carga en cada reapertura.

Push notifications quedan deliberadamente fuera para preservar el principio del PRD v1.0 §5.2: una sola atención por semana (Monday digest), no streaming de nudges. Una PWA con push tentaría a romper esa disciplina.

#### 2.4.5 Implementación
- Next.js 14 + `next-pwa` (o configuración manual de service worker con Workbox).
- Iconos generados con `pwa-asset-generator` desde el logo SVG de Ohana.
- Test obligatorio en iPhone Safari + Android Chrome antes de cualquier release. Lighthouse PWA score ≥ 90.

---

## 3. Especificación de navegación (NUEVO)

v1.0 no especificaba estructura de navegación primaria. v1.1 la define.

### 3.1 Móvil — bottom nav, 5 tabs

Agrupados por **intención**, no por módulo. Esto evita un nav de 14+ items.

| Tab | Glyph | Contenido |
|-----|-------|-----------|
| **Hoy** | `⊙` | Pantalla home con pendientes, checkin pending, citas para votar (ver §5) |
| **Capturar** | `＋` | Launcher de 5 tipos de captura rápida (ver §6) |
| **Citas** | `♡` | Votar propuestas semanales, calificar citas pasadas, biblioteca de ideas |
| **Conversar** | `§` | Acuerdos + Pregúntale a Claude + Discusiones + Temas |
| **Yo** | `●` | Perfil, configuración, ajustes de notificaciones |

Logística (pagos, mantenimiento, proyectos, viajes, salud sexual, fechas clave) vive en el iPad/web. Móvil es para captura, no para administración.

### 3.2 iPad / Web — sidebar agrupado por intención

Sidebar fijo con 4 grupos:

| Grupo | Items |
|-------|-------|
| **Hoy** | Calendario · Mis pendientes (badge) · Notificaciones (badge) |
| **Rituales** | Citas · Mimos · Checkin · Resumen |
| **Conversación** | Acuerdos · Discusiones · Temas (badge) |
| **Logística** | Pagos · Mantenimiento · Proyectos · Viajes · Salud sexual · Fechas clave |

Footer del sidebar: avatar + nombre + acceso a configuración.

Active state: background `--ink`, text `--bg`. Badges en accent terracotta.

### 3.3 Iconografía canónica

Set único compartido entre sidebar, capture cards, y accent decorations. Documentado en [`DESIGN.md` §8.1](DESIGN.md).

---

## 4. Inventario de pantallas (NUEVO)

v1.0 especificaba módulos (14 funcionales). v1.1 lista las 27 pantallas distintas que componen el producto. Cada una está mockeada en [`mockup.html`](mockup.html).

### 4.1 Sistema (5)
1. **Shell + navegación (web/iPad)** — top bar con hamburguesa + sidebar colapsable
2. **Bottom nav + Hoy + Capturar (móvil)** — navegación primaria móvil
3. **Onboarding · invitar pareja** — flujo de 3 pasos (cuenta → espacio → invitación)
4. **Monday digest (email)** — entrega de Postmark con 3 CTAs (pendientes / votar / checkin)
5. **Centro de notificaciones** — inbox unificado, agrupado por día, filtrable por tipo

### 4.2 Vistas principales (2)
6. **Calendario (iPad/web)** — grid mes + side-panel próximos 14 días
7. **Resumen mensual (iPad/web)** — narrativa editorial 4 secciones + stats strip

### 4.3 Citas (5)
8. **Sugerencias semanales (iPad/web)** — 3 propuestas estratificadas + estado de votos
9. **Votación (móvil)** — picker 2-de-3, anti-anchoring del voto del partner
10. **Biblioteca de ideas (iPad/web)** — CRUD compartido, filtros, sort
11. **Historial + ratings (iPad/web)** — citas pasadas con calificaciones duales
12. **Calificar cita (móvil)** — 1-5 + nota opcional, 24h post-evento

### 4.4 Salud emocional (7) *expandido v1.2*
13. **Checkin · captura (móvil)** — flow de 2 pasos: self-checkin → partner-rating (§10)
14. **Checkin · comparativa (iPad/web)** — side-by-side self + partner-rating revelados, tendencia 8 semanas, comments
15. **Agregar mimo (móvil)** — captura privada, emoción tag, foto opcional
16. **Sesión Mimos (iPad)** — reveal ritual presencial, motion expresiva única
17. **Archivo Mimos (iPad/web)** — post-sesión, sortable mes/autor/emoción
17b. **Mood ad-hoc · captura (móvil) *NUEVO v1.2*** — picker de 8 emojis + nota opcional, sub-15s
17c. **Mood ad-hoc · visualización (iPad/web/móvil) *NUEVO v1.2*** — heatmap 7×N + sparkline propio y pareja, análisis de Claude

### 4.5 Acuerdos · Discusiones · Temas (4)
18. **Acuerdos · lista (iPad/web)** — agrupados por categoría
19. **Pregúntale a Claude (iPad/web/móvil)** — chat con verdict structured (no concern / talk first / violation / ambiguous)
20. **Discusiones (iPad/web)** — lista + detalle con resumen / contexto / qué aprendimos
21. **Tema · detalle + timeline (iPad/web)** — ciclo de vida visualizado, discusiones y comentarios mezclados

### 4.6 Logística (6)
22. **Pagos (iPad/web)** — recurrentes mensuales, monto, pagador asignado
23. **Mantenimiento (iPad/web)** — vencidas / esta semana / próximas / completadas
24. **Proyectos · detalle (iPad/web)** — meta de ahorro, accionables, seguimientos
25. **Viajes · wishlist + próximos (iPad/web)** — galería con per-partner interest
26. **Salud sexual (iPad)** — eventos + salidas + revisiones programadas
27. **Fechas clave (iPad/web)** — aniversarios + hitos, próximas + pasadas

---

## 5. Módulo Hoy (móvil) — NUEVO

Pantalla home en móvil. Reemplaza el "ir directamente al calendario" del v1.0.

### 5.1 Propósito
Resumen accionable del día/semana. La pareja entra al móvil y ve qué necesita atención antes de hacer nada más.

### 5.2 Contenido
- **Saludo:** "Buenos días, [nombre]" en Fraunces display, con submeta italic en Fraunces small.
- **Card primario** (cuando aplica): el ritual pendiente más urgente. Usa `card-warm` accent. Ejemplo: "Tu checkin semanal · vence dom" con CTA `Empezar · 2 min`.
- **Card de citas:** estado del proceso semanal de votación. Ejemplo: "3 propuestas listas. Sofía ya votó."
- **Card de pendientes:** preview de las 3 accionables más próximas asignadas al usuario. Cada accionable con su dot de módulo y check inline.
- **Sparkline de mood (v1.2):** abajo de los cards principales, una fila visual de los últimos 7 días de mood ad-hoc propios + paralelo del partner. Tap en un punto expande la nota.
- **Botón flotante de mood quick capture (v1.2):** acceso directo al bottom-sheet con los 8 emojis. Tap → 1 emoji → enviado. Sub-15 segundos.
- Iconos en cada card: círculo coloreado del module color con glifo del set canónico.

### 5.3 Reglas
- No mostrar más de 3 cards arriba del fold.
- Si no hay nada pendiente, card vacío con copy editorial: *"Todo está en su lugar. Disfruta el día."*
- Pull-to-refresh sincroniza con backend.

---

## 6. Módulo Capturar (móvil) — NUEVO

Launcher accesible desde la segunda tab del bottom nav.

### 6.1 Propósito
Captura rápida de cualquier cosa que la pareja registre habitualmente. Una sola tap del bottom nav → menú visual de los 5 tipos.

### 6.2 Tipos de captura
| Tipo | Glyph | Background del icon | Destino |
|------|-------|---------------------|---------|
| Mood ad-hoc *v1.2* | `◔` | `--accent` (terracotta) | Bottom-sheet de 8 emojis · sub-15s |
| Mimos | `❋` | `--mimos` (terracotta) | Form de captura privada de mimo |
| Discusión | `⌇` | `--discus` (warm grey) | Form de discusión con campos contexto/lección |
| Tema | `◇` | `--ink` | Form de nuevo tema a tratar |
| Idea de cita | `♡` | `--citas` (coral) | Add a la biblioteca de citas |
| Lugar para viajar | `→` | `--viajes` (teal) | Add a la wishlist de viajes |

Mood va primero en el orden por ser el de menor fricción y mayor frecuencia esperada.

### 6.3 Reglas
- Cada item es una tarjeta con icono circular + título eyebrow + descripción corta + chevron `›`.
- El subtítulo cambia según el contexto: si la pareja no ha registrado ningún mimo este mes, el subtítulo del card Mimos es "Lleva 0 este mes" en lugar del genérico.

---

## 7. Calendario · side-panel — comportamiento default actualizado

v1.0 §6.13.2 especificaba secciones agrupadas por tipo (Citas próximas / Eventos sexuales próximos / etc.). v1.1 ajusta el default y agrega control de usuario.

### 7.1 Default
**Lista plana cronológica.** Ordenada por fecha ascendente (más próxima primero). Cada fila muestra:
- Dot del módulo
- Nombre del item
- Etiqueta del módulo en mono pequeño abajo del nombre
- Fecha en mono a la derecha (formato: `vie 9 may`)

Window: 14 días desde hoy, sin items pasados.

### 7.2 Toggle de agrupación

Debajo del título "Próximos 14 días" + subtítulo, un renglón nuevo con un checkbox:

```
☐ Agrupar por categoría
```

- **Desmarcado (default):** vista plana cronológica.
- **Marcado:** vista agrupada por tipo (Citas / Pagos / Mantenimiento / Fechas clave / Viajes / etc.) — comportamiento del v1.0 §6.13.2.

Estado del checkbox persiste por usuario (preferencia individual, no compartida con la pareja).

### 7.3 Por qué default a flat

La lista plana responde "qué sigue" sin que el usuario tenga que hacer scan visual de varias categorías. El agrupamiento es útil para escanear por módulo cuando uno está pensando "qué viene en pagos este mes", caso de uso secundario.

---

## 8. Centro de notificaciones (NUEVO)

v1.0 §7 especificaba el sistema de eventos pero no la UI del inbox. v1.1 la define.

### 8.1 Surface
Pantalla dedicada accesible desde:
- Sidebar item "Notificaciones" (iPad/web)
- Top bar action `✉` (web)
- Bottom sheet desde Hoy si hay unread (móvil)

### 8.2 Layout
- Header: título "Notificaciones" + contador de unread + acción "Marcar todas leídas".
- Tabs filtro: Todas · Citas · Pagos · Mimos · Acuerdos · Sistema.
- Agrupación por **día** ("Hoy · lunes 4 mayo", "Domingo · 3 mayo", etc.), no por tipo.
- Cada notif row: icono circular + cuerpo + timestamp.
- Unread state: background `--surface`. Read state: transparent.

### 8.3 Privacy markers en payloads sensibles
- Notif de mimo nuevo: `"Sofía agregó un mimo nuevo"` + pill `Sorpresa`. **Nunca contenido del mimo.**
- Notif de revisión médica: muestra fecha y tipo, no detalles del estudio.

---

## 9. Component decisions con impacto cross-feature

Estas decisiones de componente afectan múltiples features y son canon. Detalle visual en [`DESIGN.md` §8](DESIGN.md).

### 9.1 Pregúntale a Claude · output structured
Las respuestas de Claude se renderean como tarjetas con verdict pill + acuerdos relevantes + recomendación. Verdict siempre es uno de: `no concern` · `talk first` · `violation` · `ambiguous`. Esto match con el principio §9.3 del PRD v1.0 ("Para scenario checking, return structured output").

### 9.2 Vote-cards picked state
El estado "picked" de una vote-card en el módulo Citas usa fondo paper + borde tinta 2px + checkmark `✓` en círculo de tinta arriba a la derecha. **No usa accent flood.** Esto preserva el accent (terracotta) para el momento de consenso alcanzado.

### 9.3 Banner de consenso (citas)
Cuando hay overlap de votos, el banner de consenso usa card neutro con borde accent 2px y CTA en color tinta (no terracotta). Mantiene jerarquía sin doble-naranja con las vote-cards picked.

### 9.4 Card-warm pattern
Para callouts especiales (próxima fecha clave destacada, mes actual oculto en archivo Mimos), `.card-warm` siempre tiene border-radius y padding default. No raw blocks.

### 9.5 Mimos session reveal motion
La sesión de Mimos es la **única** motion expresiva del producto. Card-flip 600ms con ease anticipatorio, beat de silencio entre cards. El resto del producto usa motion minimal-functional 150ms ease-out.

---

## 10. Checkin semanal · partner-rating (NUEVO v1.2)

v1.0 §6.8 especificaba el checkin como evento individual de auto-reflexión. v1.2 agrega un segundo paso: cada usuario califica la energía y estrés percibidos de su pareja durante la semana.

### 10.1 Propósito
- **Self-checkin** captura cómo te sientes tú.
- **Partner-rating** captura cómo tu pareja te vio a ti.
- La divergencia entre los dos es señal valiosa: si A se reportó con energía 7 pero B la percibió en 4, hay una conversación pendiente sobre comunicación o sobre la percepción que cada uno proyecta.

Este NO es un sistema de evaluación. Es captura de **percepción**. El framing y el copy refuerzan eso constantemente.

### 10.2 Schema · columnas nuevas en `checkins`

```sql
ALTER TABLE checkins
  ADD COLUMN partner_energia_percibida integer
    CHECK (partner_energia_percibida BETWEEN 1 AND 10),
  ADD COLUMN partner_estres_percibido text
    CHECK (partner_estres_percibido IN ('baja','mediana','alta','extrema'));
```

Las dimensiones percibidas usan **las mismas escalas** que las self-reportadas (`energia` 1-10, `presion_trabajo` enum) para permitir comparación directa sin recalibración mental.

### 10.3 Flow

```
Paso 1 — Self-checkin (existente, sin cambio)
  · estado_animo
  · energía 1-10
  · deseo 1-10
  · presión_trabajo (enum)
  · comentario libre

Paso 2 — Partner-rating (NUEVO)
  framing: "Así viste a tu pareja esta semana"
  · partner_energia_percibida 1-10
  · partner_estres_percibido (enum)
  (sin campo de comentario libre — mantenemos baja fricción)

Submit → ambos pasos viajan en un solo POST contra `checkins`.
```

El paso 2 es **opcional skippeable**. Si el usuario lo skipea, verá menos información en la comparativa pero el checkin self queda registrado normalmente.

### 10.4 Visibilidad — anti-anchoring (extendido)

La regla de v1.0 §6.8.3 se preserva y extiende: nada se revela hasta que **ambos miembros completen al menos el paso 1**. Cuando ambos completan, la comparativa desbloquea:

- Self-ratings de ambos lado a lado (como en v1.0)
- **NUEVO:** Self-rating vs Partner-rating por usuario:
  - "Tú dijiste energía **7**. Sofía te vio en **5**."
  - "Sofía dijo presión **mediana**. Tú la viste en **alta**."
- Trend 8 semanas con cuatro líneas: self-energía A, partner-rated-energía A, self-energía B, partner-rated-energía B.

### 10.5 Frame UX
- Copy del paso 2 enfatiza: *"Esto no califica a tu pareja. Captura cómo la viste tú esta semana. La diferencia con lo que ella sintió es información, no un veredicto."*
- En la comparativa, las divergencias se muestran como observaciones, no como problemas. Ejemplo: *"Se vieron diferente esta semana en energía. ¿Vale platicarlo?"*
- Nunca usar ranking/score language. Nunca decir "acertaste" o "fallaste" en la percepción.

### 10.6 Claude integration · punto nuevo (#6)
Claude detecta divergencias significativas en partner-rating vs self-rating:
- Umbral: ≥ 3 puntos en energía, o ≥ 1 nivel en estrés enum.
- Si la divergencia es **recurrente** (3+ semanas consecutivas), se eleva a la sección Conexión del Resumen mensual.
- Si la divergencia es **aguda y única**, se nota en la comparativa de esa semana específica con un disclaimer suave.

---

## 11. Módulo Mood ad-hoc (NUEVO v1.2)

Captura ligera de estado emocional en cualquier momento, ilimitadas veces por semana. Complementa el checkin semanal sin reemplazarlo.

### 11.1 Propósito
El checkin semanal captura una **reflexión estructurada** sobre 7 días pasados. El mood ad-hoc captura el **pulso en el momento**. Los dos viven en paralelo y miden cosas distintas.

Diseño explícito: el mood ad-hoc **no pre-puebla ni edita** el checkin semanal. Cada uno es su propia entidad. Esto preserva el ritual semanal como momento de reflexión fresca.

### 11.2 Schema · tabla nueva

```sql
CREATE TABLE mood_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id),
  user_id uuid NOT NULL REFERENCES users(id),
  emocion text NOT NULL,
  nota text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_mood_checkins_user_time
  ON mood_checkins(user_id, created_at DESC);

CREATE INDEX idx_mood_checkins_couple_time
  ON mood_checkins(couple_id, created_at DESC);
```

`emocion` se valida en aplicación contra el set curado (no es enum SQL para permitir evolución sin migración).

### 11.3 Emojis curados (8)

Set fijo en v1.2. Uno por emoción — no hay dos opciones que signifiquen lo mismo. Cualquier expansión requiere user research.

| Emoji | Emoción (key) | Tono |
|-------|---------------|------|
| 🥰 | `carinoso` | + relacional |
| 😊 | `feliz` | + general |
| 😌 | `tranquilo` | + calma |
| 😐 | `neutral` | neutro |
| 😴 | `agotado` | − energía |
| 😰 | `ansioso` | − estrés |
| 😔 | `triste` | − ánimo |
| 😤 | `frustrado` | − enojo |

Balance: 3 positivos / 1 neutro / 4 negativos. El sesgo a negativos es intencional: ahí está la señal-a-ruido más alta para insight de pareja.

### 11.4 Captura
- **Surfaces:**
  - Tile dentro del módulo Capturar (móvil) — primer item del grid.
  - Bottom-sheet flotante desde el módulo Hoy (móvil) — tap en el botón de mood quick capture.
  - Botón en el header del módulo Mood ad-hoc (iPad/web).
- **Form:** grid 4×2 de los 8 emojis con large tap targets, campo de nota libre opcional debajo, botón "Enviar".
- **Tiempo objetivo:** sub-15 segundos extremo a extremo.
- **Offline-capable:** si no hay red, el mood se guarda en IndexedDB como draft y se sincroniza al primer plano cuando vuelva la conexión (ver §2.4.2).

### 11.5 Visibilidad
- **Tiempo real.** El mood se vuelve visible para la pareja inmediatamente al enviar, vía Supabase realtime (suscripción en `mood_checkins` filtrada por `couple_id`).
- **Sin notificación.** **No se dispara** push, ni in-app notif, ni email. El partner ve el mood cuando entre al producto y abra el sparkline en Hoy o el heatmap dedicado. Esto preserva el principio "no streaming de nudges" del PRD v1.0 §5.2.
- **No bidireccional asíncrona:** mood es una emisión, no una pregunta. No hay forma de "responder" a un mood específico desde notif (porque no hay notif).

### 11.6 Visualización

#### En el módulo Hoy (móvil)
- **Sparkline horizontal** de los últimos 7 días de moods, dos filas paralelas (propio + partner).
- Cada punto es el emoji del mood capturado en ese momento (timestamp en eje X).
- Tap en un punto → expande la nota si la hay.

#### En vista dedicada (iPad/web/móvil)
- **Heatmap 7 × N**: filas = días de la semana, columnas = semanas. Celdas coloreadas por mood dominante del día (si hubo varios, el más frecuente; si empate, el más reciente). Hover/tap muestra detalle de cada captura individual.
- Filtros: `solo míos · solo de mi pareja · ambos en paralelo`.
- Vista alterna **timeline cronológico** para usuarios que prefieren lista sobre matriz.
- Botón "ver patrones" → expone el análisis de Claude (ver §11.7).

### 11.7 Claude integration · punto nuevo (#7)
Claude analiza moods ad-hoc para:
- **Patrones temporales:** "ansioso recurrentemente los jueves en la tarde", "frustrado al final del mes alrededor del cierre de pagos".
- **Shifts agudos:** un cambio sostenido del mood dominante (ej. de `tranquilo` a `frustrado` durante 2+ semanas).
- **Síntesis mensual:** input adicional a la sección Conexión del Resumen mensual con frases como *"Sofía registró 14 moods en abril, 9 positivos. Pico de ansiedad los miércoles, alineado con sus juntas de proyecto."*

### 11.8 Privacidad
- Misma RLS que el resto del producto: solo accesible por miembros del `couple_id`.
- La nota libre es texto sensible — tratada con el mismo nivel de cuidado que SaludSexual: encriptada at rest (Supabase default), no en logs de aplicación, no en métricas de telemetría.

---

## 12. Mapa de cambios v1.0 → v1.2

| Sección v1.0 | Cambio v1.1 |
|--------------|-------------|
| §2.3 Devices | Agregada superficie web (3ra) con spec de top bar + hamburguesa |
| §2.3 Devices | **PWA en móvil** · instalable + IndexedDB para drafts y preferencias. Sin push, sin background sync (ver §2.4) |
| §6.3 Gastos Mensuales | Renombrado a "Pagos". v2 schema (con monto) adelantado a v1 |
| §6.8 Checkin · `estado_animo` enum | `hump` → `agotado` |
| §6.9 Mimos visibility | Confirmado: surprise model |
| §6.13 Calendario · side panel | Default flipeado de "agrupado" a "cronológico plano" + checkbox `Agrupar por categoría` |
| §7 Notification System | Especificación de UI del centro de notificaciones agregada |
| §11 Open Decisions | Las 8 decisiones quedan resueltas (ver §1 de este documento) |
| (nuevo) | Módulo Hoy (móvil) |
| (nuevo) | Módulo Capturar (móvil) |
| (nuevo) | Inventario de 27 pantallas |
| (nuevo) | Iconografía canónica |
| (nuevo) | Component decisions cross-feature (§9) |
| **v1.2** | |
| §6.8 Checkin Semanal | Agregado paso 2 · partner-rating de energía + estrés. Comparativa post-revelación incluye divergencias self-vs-partner (§10) |
| §6.8 Schema `checkins` | Columnas nuevas: `partner_energia_percibida` (1-10), `partner_estres_percibido` (enum) |
| §6.8 Visibilidad anti-anchoring | Extendida — partner-ratings también ocultos hasta que ambos completen el flow |
| §9.1 AI integration points | Expandido de 5 a 7: agregadas detección de divergencias rating (#6) y análisis de patrones mood ad-hoc (#7) |
| (nuevo) Schema | Tabla `mood_checkins` para captura ad-hoc ilimitada por semana |
| (nuevo) | Módulo Mood ad-hoc completo (§11) — 8 emojis curados, captura sub-15s, visible inmediato sin notificar |
| §5 Módulo Hoy v1.1 | Agregado sparkline 7-días de mood + botón flotante de quick capture |
| §6 Módulo Capturar v1.1 | Agregado Mood como primer tile (orden por menor fricción) |
| §4 Inventario | +2 surfaces: 17b mood capture (móvil) y 17c mood visualización (iPad/web/móvil) |

---

## 13. Listo para scaffold

Con v1.1 quedan resueltos los bloqueos de §11 del PRD original. Los siguientes pasos son:

1. **Scaffold Next.js + Supabase** según stack §12 del PRD v1.0.
2. **Implementar tablas core** según §8 del PRD v1.0 con ajustes:
   - `accionables.parent_pago_id` reemplaza `parent_gasto_id`.
   - `checkins.estado_animo` permite `agotado` (4to valor del enum).
   - `checkins` gana `partner_energia_percibida` y `partner_estres_percibido` (v1.2 · §10.2).
   - Nueva tabla `mood_checkins` con sus dos índices (v1.2 · §11.2).
3. **Construir shell de navegación** (web/iPad sidebar + móvil bottom nav) por §3 de este documento.
4. **Implementar pantallas en orden de fase** del §13 del PRD v1.0:
   - Fase 1: Auth, Onboarding (#3), Calendario (#6), Citas suggest+vote+ideas+events (#8-11), Checkin captura (#13), Notificaciones (#5), Monday digest (#4).
   - Fase 2: Acuerdos (#18), Pregúntale a Claude (#19), Discusiones (#20), Temas (#21), Mimos add+session+archive (#15-17).
   - Fase 3: Pagos (#22), Mantenimiento (#23), Proyectos (#24), Viajes (#25), Salud sexual (#26), Fechas clave (#27).
   - Fase 4: Resumen mensual (#7), pattern detection, tema suggestions, Postmark email worker.
5. **Cumplir DESIGN.md** en cada componente. Cualquier desviación requiere actualizar DESIGN.md primero.

---

**Fin del documento v1.2.**

*Este PRD captura las decisiones tomadas durante las sesiones del 2026-05-07 (v1.1) y 2026-05-11 (v1.2). La fuente visual canónica es [`mockup.html`](mockup.html); la fuente de sistema visual es [`DESIGN.md`](DESIGN.md); el PRD original (v1.0) sigue siendo la referencia para todo lo no tocado en estos deltas.*

*Nota: las pantallas 17b (mood capture) y 17c (mood visualización) y el paso 2 del checkin no están mockeadas todavía en `mockup.html`. Pendiente actualizar el mockup en una iteración separada.*
