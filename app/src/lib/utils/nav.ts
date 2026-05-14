export type NavGroup = {
  label: string;
  items: NavItem[];
};

export type NavItem = {
  href: string;
  label: string;
  glyph: string;
  badge?: number;
};

export const sidebarNav: NavGroup[] = [
  {
    label: 'Hoy',
    items: [
      { href: '/calendario', label: 'Calendario', glyph: '▦' },
      { href: '/pendientes', label: 'Mis pendientes', glyph: '◐' },
      { href: '/notificaciones', label: 'Notificaciones', glyph: '✉' },
    ],
  },
  {
    label: 'Rituales',
    items: [
      { href: '/citas', label: 'Citas', glyph: '♡' },
      { href: '/mimos', label: 'Mimos', glyph: '❋' },
      { href: '/checkin', label: 'Checkin', glyph: '⊙' },
      { href: '/mood', label: 'Mood', glyph: '◔' },
      { href: '/resumen', label: 'Resumen', glyph: '✦' },
    ],
  },
  {
    label: 'Conversación',
    items: [
      { href: '/acuerdos', label: 'Acuerdos', glyph: '§' },
      { href: '/discusiones', label: 'Discusiones', glyph: '⌇' },
      { href: '/temas', label: 'Temas', glyph: '◇' },
    ],
  },
  {
    label: 'Logística',
    items: [
      { href: '/pagos', label: 'Pagos', glyph: '$' },
      { href: '/mantenimiento', label: 'Mantenimiento', glyph: '⌂' },
      { href: '/proyectos', label: 'Proyectos', glyph: '▤' },
      { href: '/viajes', label: 'Viajes', glyph: '→' },
      { href: '/salud-sexual', label: 'Salud sexual', glyph: '+' },
      { href: '/fechas-clave', label: 'Fechas clave', glyph: '★' },
    ],
  },
];

export const bottomNav: NavItem[] = [
  { href: '/hoy', label: 'Hoy', glyph: '⊙' },
  { href: '/capturar', label: 'Capturar', glyph: '＋' },
  { href: '/citas', label: 'Citas', glyph: '♡' },
  { href: '/acuerdos', label: 'Conversar', glyph: '§' },
  { href: '/ajustes', label: 'Yo', glyph: '●' },
];
