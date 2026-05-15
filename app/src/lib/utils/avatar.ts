/**
 * Sistema de avatar de usuario · emoji + color de fondo.
 *
 * Cada usuario tiene:
 *  - emoji (selectable de un set curado)
 *  - color de fondo (de una paleta 5x5 = 25 opciones)
 *
 * Por default, el avatar es 😀 sobre accent-soft (el terracotta pálido).
 */

/**
 * Set curado de emojis para avatares.
 * Incluye variedad: caras, animales, naturaleza, comida, símbolos.
 * Limitado a opciones que se ven bien sobre fondo de color sólido.
 */
export const AVATAR_EMOJIS = [
  // Caras
  '😀', '😎', '🤓', '😇', '🙃', '😌', '🥰', '🤗',
  // Naturaleza
  '🌸', '🌺', '🌻', '🌷', '🌹', '🌵', '🌿', '🍀',
  // Animales
  '🦊', '🐱', '🐶', '🐼', '🦁', '🐯', '🐻', '🦄',
  // Comida
  '🍓', '🍑', '🥑', '🍋', '🥥', '🍒', '🥨', '🍪',
  // Símbolos
  '⭐', '✨', '💫', '🔥', '💎', '🌙', '☀️', '⚡',
] as const;

export type AvatarEmoji = (typeof AVATAR_EMOJIS)[number];

/**
 * Paleta de 25 colores para el fondo del avatar.
 * Curada para verse bien con emojis en superficie cremosa de la app.
 * Ordenada en grid 5x5 visual (de cálidos a fríos, suaves a saturados).
 */
export const AVATAR_COLORS = [
  // Fila 1 · cálidos pálidos
  '#FBE5DC', '#FBD4C0', '#F7B89F', '#F49678', '#E0654B',
  // Fila 2 · ocres / amarillos
  '#FFF3CC', '#FFE599', '#FFD466', '#F2C037', '#D9A106',
  // Fila 3 · verdes
  '#E0EEDC', '#C5DEB8', '#A3CB91', '#7DAE6B', '#5A7A47',
  // Fila 4 · azules / mar
  '#D6E7E8', '#B7D5D8', '#8FBBC0', '#618D94', '#4D8489',
  // Fila 5 · violetas / rosas
  '#E8D5E0', '#D9B8CE', '#C496BA', '#A8709E', '#8C5E8A',
];

/**
 * Color por default (terracotta soft, alineado con el accent del sistema).
 */
export const DEFAULT_AVATAR_EMOJI = '😀';
export const DEFAULT_AVATAR_COLOR = '#E8B89F';

/**
 * Avatar data shape · subset mínimo que un componente necesita para renderear.
 */
export type AvatarData = {
  emoji: string | null;
  color: string | null;
};

/**
 * Helper · regresa emoji + color para mostrar, con fallback a defaults.
 */
export function resolveAvatar(data: Partial<AvatarData> | null | undefined): { emoji: string; color: string } {
  return {
    emoji: data?.emoji ?? DEFAULT_AVATAR_EMOJI,
    color: data?.color ?? DEFAULT_AVATAR_COLOR,
  };
}

/**
 * Detecta si un color es "claro" (necesita texto oscuro encima).
 * Usado para decidir si el emoji se ve sobre el fondo · si fondo claro
 * algunos emojis con tonos blancos se pierden.
 */
export function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  // Luminance perceptual (rec 709)
  const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luma > 0.65;
}
