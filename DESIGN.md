# Design System — Ohana

> **Dirección visual: Domestic Modernism**
> Editorial cálido, modernista, distinctly Mexican. Un cuaderno compartido bien hecho, no un dashboard SaaS.

---

## 1. Product Context

- **Qué es:** plataforma de dos usuarios para parejas. Maneja la dimensión operativa (citas, mantenimiento, pagos, viajes) y emocional (checkins, acuerdos, mimos, discusiones) de la vida compartida.
- **Para quién:** parejas serias que quieren tratar la relación con la misma intencionalidad que cualquier otro proyecto importante de su vida.
- **Idioma del producto:** español (mexicano). Nombres de módulos siempre en español. Código en inglés.
- **Tipos de superficie:**
  - **Móvil = captura.** Forms de una sola pantalla, large tap targets, voice input habilitado en campos de texto largo.
  - **iPad = consumo.** Layouts editoriales, calendario con side-panel, timelines, Resumen mensual con tipografía magazine.
  - **Web = consumo + admin.** Top bar fijo arriba con hamburguesa que colapsa el sidebar.
- **Tono:** editorial, cálido, confiado. Trata a la pareja como adultos serios co-administrando una vida, no como pacientes en terapia.

---

## 2. Aesthetic Direction

### 2.1 Mood
- **Domestic Modernism.** Editorial-leaning, warm, confident. Inspirado en *Kinfolk* + *Apartamento* aplicado a un producto funcional. La tipografía hace la mayor parte del trabajo. La decoración es mínima pero considerada.
- **Lo que NO somos:** therapy app pastel, productivity tool gris/azul, gradientes morados, blob decorations, ilustraciones de parejitas caricaturescas.

### 2.2 EUREKA principle
Casi todas las apps de pareja tratan a la pareja como pacientes en clínica (suaves, gentiles, low-stakes, simplificadas). El PRD de Ohana las trata como adultos serios co-administrando una vida — dinero, salud, acuerdos, conflicto. **El diseño respeta esa inteligencia.**

### 2.3 Decisiones de aesthetic
- **Decoration level:** intentional. Nunca minimal-frío, nunca expressive-recargado.
- **Texture:** viene del contraste tipográfico (serif display + humanist sans), fondos cremosos cálidos, y un acento bold usado raramente.
- **Anti-slop:** prohibido en todo el sistema — gradientes morados como acento default, 3-column feature grids con iconos en círculos pastel, todo centrado, border-radius bubbly uniforme, gradient buttons como CTA primario, ilustraciones genéricas de couples.

---

## 3. Typography

### 3.1 Fonts

| Rol | Fuente | Por qué |
|-----|--------|---------|
| **Display / Hero / Section headings** | **Fraunces** (variable serif, opsz 9..144, weights 300-600, italic disponible) | Maneja diacríticos del español hermosamente, tiene calidez Latin sin ser cliché, flexible vía variable axes. Carga el Resumen mensual con la gravitas que merece. |
| **Body / UI** | **Instrument Sans** (weights 400-600) | Humanista, cálido, lee bien en español, tiene `tabular-nums` para el stats strip. |
| **Data / Mono** | **Geist Mono** (weights 400-500) | Para fechas, montos MXN, deltas en stats. Numerals tabulares. |

### 3.2 Loading
Vía Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,400&family=Instrument+Sans:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### 3.3 Modular scale

| Token | Mobile | iPad | Notes |
|-------|--------|------|-------|
| Display (Fraunces 400, opsz 144) | 32px | 48-64px | Hero del Calendario, Resumen, etc. |
| H1 (Fraunces 500, opsz auto) | 24px | 32px | Section titles |
| H2 (Instrument Sans 600) | 18px | 22px | Component titles |
| Body (Instrument Sans 400) | 16px / 1.55 | 17px / 1.55 | Default reading |
| Small (Instrument Sans 400) | 13px | 14px | Meta text |
| Caption / eyebrow (Instrument Sans 600 all-caps, +0.08em tracking) | 11px | 12px | Section labels |
| Mono data (Geist Mono 500, tabular-nums) | 13px | 14px | Numbers, dates, MXN |

### 3.4 Reglas duras
- **Italic Fraunces** se usa como recurso emocional (subheads de Resumen, títulos de Mimos, palabras destacadas en headlines). Nunca como body principal.
- Nunca usar Inter, Roboto, Arial, Helvetica, Open Sans, Lato, Montserrat, Poppins.
- Nunca Papyrus, Comic Sans, Lobster, Impact, Trajan, Raleway, Clash Display.

---

## 4. Color System

### 4.1 Base palette

```css
--bg:        #FBF7F2;  /* Paper — canvas principal */
--surface:   #F4EDE3;  /* Cream — cards */
--surface-2: #EFE6D8;  /* Surface hover, dense rows */
--surface-3: #E8DDC8;  /* Borders más cálidos */
--ink:       #1A1714;  /* Warm near-black — texto, dark mode bg */
--muted:     #6B6358;  /* Stone — secondary text */
--muted-2:   #9A9082;  /* Disabled, calendar muted days */
--line:      #E2D9CB;  /* Borders default */
--line-2:    #D4C9B8;  /* Borders más definidos */

--accent:      #C4623E;  /* Terracotta — el único acento bold */
--accent-soft: #E8B89F;  /* Tints suaves del accent */
--accent-deep: #8E4427;  /* Texto sobre accent-soft */

--success: #5A7A47;  /* Sage */
--warning: #C99432;  /* Warm amber */
--error:   #A8362B;  /* Deep rust — misma familia que accent */
```

### 4.2 Module colors (calendar dots, side-panel labels, tags)

Desaturados ~15-20% para vivir dentro del sistema cálido sin gritar.

```css
--citas:      #B85544;  /* coral */
--salud:      #8C5E8A;  /* plum */
--gastos:     #C99432;  /* amber */
--proyectos:  #4A6B82;  /* steel blue */
--mant:       #5A7A47;  /* sage */
--viajes:     #4D8489;  /* teal */
--fechas:     #B89043;  /* gold */
--discus:     #8B847A;  /* warm grey */
--mimos:      #C4623E;  /* terracotta (same as accent) */
```

### 4.3 Color rules (post-iteration)

- **Una sola dirección de acento:** terracotta. Todo lo "bold" en el producto pasa por ese color.
- **Selecciones (vote-cards picked, pendientes marked) NO usan accent flood.** Usan `bg` blanco + borde tinta de 2px + checkmark `✓` en círculo de tinta. Esto evita el "doble naranja" cuando coexisten con un banner accent.
- **Banners destacados** (consenso alcanzado, próxima fecha clave): tarjeta con `bg` paper + borde accent de 2px + texto eyebrow en accent. **Nunca flood `accent-soft`** porque pierde jerarquía cuando hay otro elemento accent cerca.
- **Card variant `card-warm`** (próximas fechas, callouts especiales): mantiene fondo `accent-soft` cálido pero con `border-radius` y padding default. No raw blocks.
- **Pills semánticos** (verdict en Pregúntale a Claude, status badges): success/warn/error usan tints suaves de cada color con texto del color profundo, no flood saturado.

### 4.4 Dark mode strategy

Reduce saturación 15-20% del accent. Background `--ink`, surfaces más cálidas que el background. No redesign del sistema — los mismos tokens se invierten coherentemente.

---

## 5. Spacing & Density

### 5.1 Base
- **Unit:** 4px
- **Mobile density:** comfortable (default 16, dense 12, breathing 24)
- **iPad density:** spacious (default 24, dense 16, breathing 48)

### 5.2 Border radius — hierarchical

```css
--r-sm:  4px;   /* inputs, chips, small buttons */
--r-md:  8px;   /* cards, modals chicos */
--r-lg:  16px;  /* sheets, mimos cards, session stage */
```

Avatares full circle. **Nada más fully rounded.** No bubble UI uniforme.

---

## 6. Layout

### 6.1 Web / iPad shell

- **Top bar fijo arriba** (full width). Background `--ink`, contenido en `--bg` cream:
  - `☰` hamburguesa — toggle del sidebar (collapsed = `grid-template-columns: 0 1fr`, transición 220ms ease)
  - Brand `Ohana` en Fraunces 18px
  - Couple meta en mono pequeño con divider izquierdo
  - Acciones derecha: ⌕ buscar, ＋ capturar rápido, ✉ notificaciones (con dot accent), avatar
- **Sidebar colapsable** debajo del top bar. Agrupado por intención:
  - Hoy (Calendario, Mis pendientes, Notificaciones)
  - Rituales (Citas, Mimos, Checkin, Resumen)
  - Conversación (Acuerdos, Discusiones, Temas)
  - Logística (Pagos, Mantenimiento, Proyectos, Viajes, Salud sexual, Fechas clave)
- **Pane derecho** con padding 32px, contenido principal del módulo.

### 6.2 Mobile shell

- **Bottom nav** de 5 tabs agrupados por intención (no espejea el sidebar):
  - Hoy · Capturar · Citas · Conversar · Yo
- **No hay hamburguesa en móvil.** El bottom nav es la navegación primaria.

### 6.3 iPad calendar layout

- Grid `7fr 3fr` — calendario izquierda, side panel derecha.
- Side panel "Próximos 14 días":
  - Título + subtítulo italic en una sola columna
  - Renglón nuevo: **checkbox** `☐ Agrupar por categoría` (default desmarcado)
  - Default = lista plana cronológica (más recientes primero, módulo etiquetado debajo del nombre)
  - Marcado = vista agrupada por tipo (Citas / Pagos / Mantenimiento / Fechas clave)

### 6.4 iPad consumption (Resumen mensual)

- Editorial 12-column. Drop cap solo en la primera narrativa (Conexión).
- Stats strip: 4 columnas con label / valor / delta vs mes anterior.
- Cuatro narrativas (Conexión, Conflicto, Logística, Intimidad), eyebrow accent + body Fraunces 19px line-height 1.65.
- Max width body 62ch para legibilidad de prosa larga.

### 6.5 Mobile capture

- Single-screen forms. Una pregunta primaria por pantalla cuando sea razonable.
- Tap targets ≥ 44pt.
- Voice input habilitado en `descripcion`, `comentarios`, `contexto_causante`, mimos `descripcion`.
- Camera shortcut directa para upload de fotos (Mimos, Wishlist).

---

## 7. Motion

### 7.1 Default
**Minimal-functional.** 150ms ease-out para state changes, transiciones de hover, toggles.

### 7.2 La excepción ritual
**Sesión de Mimos** es el único momento expresivo. Card-flip lento, 600ms ease anticipatorio, alternando autores, con un beat de silencio entre tarjetas. Es el momento que justifica el producto entero — la motion lo subraya.

### 7.3 Easing tokens
```css
--ease-enter: cubic-bezier(0.0, 0.0, 0.2, 1);   /* ease-out */
--ease-exit:  cubic-bezier(0.4, 0.0, 1, 1);     /* ease-in */
--ease-move:  cubic-bezier(0.4, 0.0, 0.2, 1);   /* ease-in-out */
--ease-ritual: cubic-bezier(0.16, 1, 0.3, 1);   /* anticipatorio para Mimos reveal */
```

### 7.4 Duration tokens
- `micro` 50-100ms — micro-feedback
- `short` 150-250ms — default state changes
- `medium` 250-400ms — sidebar collapse, panel toggle
- `long` 400-700ms — Mimos reveal

---

## 8. Component Decisions

Decisiones tomadas durante la iteración del mockup que viven aquí para no perderse.

### 8.1 Iconography
Glifos consistentes entre sidebar, capture cards, y accent decorations:

| Concept | Glyph |
|---------|-------|
| Hoy / Calendar | `▦` |
| Mis pendientes / Pend states | `◐` |
| Notificaciones | `✉` |
| Citas / Heart | `♡` |
| Mimos | `❋` |
| Checkin | `⊙` |
| Resumen | `✦` |
| Acuerdos | `§` |
| Discusiones | `⌇` |
| Temas | `◇` |
| Pagos | `$` |
| Mantenimiento / Hogar | `⌂` |
| Proyectos | `▤` |
| Viajes | `→` |
| Salud sexual | `+` |
| Fechas clave / Aniversario | `★` |
| Buscar | `⌕` |
| Capturar rápido | `＋` |

### 8.2 Card patterns

- **`.card`** — surface cream + line border + radius 8px + padding 16px. Default neutro.
- **`.card-icon-row`** — flex row con círculo de icono 40px (background del module color) + contenido. Usado en Hoy mobile cards y Capturar options.
- **`.card-warm`** — accent-soft background + accent border + radius 8px + padding 18px. Para callouts especiales (próximo aniversario, mes actual oculto en archivo Mimos).
- **Banner de consenso (citas)** — `card` con `border: 2px solid var(--accent)`, fondo paper, CTA en `btn` (tinta) no `btn-accent` (naranja). Evita el doble-naranja con vote-cards picked.
- **Vote card picked state** — fondo blanco + borde tinta 2px + checkmark `✓` en círculo de tinta arriba a la derecha. **Nunca accent flood.**

### 8.3 AI bubbles (Pregúntale a Claude)

- **User bubble:** background ink, color bg, radius 8/8/4/8.
- **AI bubble:** background **white puro `#FFFFFF`** + border `accent-soft` 1px + sombra mínima (`0 1px 0 rgba(196,98,62,0.04)`), radius 8/8/8/4.
- **Verdict pills dentro del AI bubble:**
  - `no-concern` — soft sage on deep sage
  - `talk-first` — soft amber on deep amber
  - `violation` — soft rust on deep rust
  - `ambiguous` — surface-2 on muted

### 8.4 Calendar side-panel

- Default = **lista plana cronológica** (no agrupada).
- Cada fila: dot del módulo + nombre + módulo etiquetado en mono pequeño + fecha en mono.
- Checkbox `Agrupar por categoría` reagrupa en secciones (Citas / Pagos / Mantenimiento / Fechas clave).
- El checkbox usa `accent-color: var(--accent)` para que el check sea terracotta.

### 8.5 Form inputs

- Background `--surface` (cream), border `--line`, radius 8px, padding 12-14px.
- Placeholder en italic Fraunces (no Instrument Sans) para señalar "este texto va aquí pero no es real".
- Field label: caption all-caps muted arriba.

---

## 9. Privacy & Sensitivity Markers

Visual treatment para datos sensibles del PRD:

- **SaludSexual:** badge `PRIVADO · ENCRIPTADO` en el ipad-bar de la pantalla. Sin imágenes en la lista por default.
- **Mimos pre-sesión:** mensaje explícito "oculto hasta el 1 junio" usando card-warm. Nunca preview del contenido.
- **Pregúntale a Claude:** mensaje al final del chat "Las preguntas son privadas. Sofía no las ve a menos que tú las compartas."
- **Notificaciones:** payload de mimos nuevos solo dice "Sofía agregó un mimo nuevo" + pill `Sorpresa`. Nunca el contenido.

---

## 10. Reference Files

Los HTML mockups se mantienen en este folder como verdad visual:

| File | Purpose |
|------|---------|
| `mockup.html` | **Mockup canónico** con 27 pantallas en Domestic Modernism. TOC sticky a la izquierda. Funcional (hamburguesa, checkbox del side panel, tema toggle). |
| `proposal-1-domestic-modernism.html` | Propuesta original con calendario + resumen + checkin + mimos card. |
| `proposal-2-quiet-instrument.html` | Alternativa Swiss/brutalist (no seleccionada). Sirve como referencia de "lo que NO es Ohana". |
| `proposal-3-mediterranea.html` | Alternativa color-blocked maximalist (no seleccionada). |
| `proposal-4-notebook-noir.html` | Alternativa dark-first editorial (no seleccionada). |

Para abrir el mockup: doble-click en `mockup.html` o servir con `python3 -m http.server` desde el folder.

---

## 11. Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-07 | **Domestic Modernism** seleccionado sobre 3 alternativas (Quiet Instrument, Mediterránea, Notebook Noir) | Más balance entre warmth + intelligence. No therapy-soft, no SaaS-cold. |
| 2026-05-07 | **Fraunces serif** como display, no sans-only | Diferenciación instantánea de productivity tools. Carga el Resumen con gravitas. Maneja diacríticos español. |
| 2026-05-07 | **Terracotta `#C4623E`** como único accent | Mexican-warm sin ser cliché pink. Distintivo en una categoría llena de pastels y blues. |
| 2026-05-07 | Mobile capture / iPad consumption split | Match al PRD. Component family separada. |
| 2026-05-07 | Sidebar colapsable + top bar con hamburguesa para web | Solicitud directa: web view necesita poder esconder el sidebar. Animación 220ms ease. |
| 2026-05-07 | Side-panel: default = flat chronológico, checkbox `Agrupar por categoría` para reagrupar | Iteración: el segmented control `Por tipo / Cronológico` no funcionaba. Checkbox unchecked = vista más útil para "qué sigue", checkbox marcado = vista para escanear por módulo. |
| 2026-05-07 | Iconos en cards de Hoy + Capturar (móvil) | Solicitud directa. Glifos consistentes con sidebar. Círculos de color del module. |
| 2026-05-07 | AI bubbles fondo blanco + accent-soft border (no sepia) | El sepia (`--surface`) peleaba con los verdict pills. Blanco da claridad para verdicts estructurados. |
| 2026-05-07 | Vote-cards picked: blanco + ink-border + check, no accent flood | Doble-naranja con el banner de consenso se veía mal. Selección discreta libera el accent para el momento de consenso. |
| 2026-05-07 | Banner de consenso: `card` con border accent 2px + CTA `btn` (tinta), no `card-warm` flood + `btn-accent` | Mismo problema de doble-naranja. Banner mantiene jerarquía sin saturar. |
| 2026-05-07 | `.card-warm` rounded + padding default | Antes se veían como raw blocks sin chrome en Mimos archive y Fechas clave. |
| 2026-05-07 | Animación de Mimos session = única motion expresiva del sistema | Justificación ritual del producto. Resto = minimal-functional 150ms. |
