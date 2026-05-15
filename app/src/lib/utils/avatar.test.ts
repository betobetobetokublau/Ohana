import { describe, it, expect } from 'vitest';
import {
  AVATAR_EMOJIS,
  AVATAR_COLORS,
  DEFAULT_AVATAR_EMOJI,
  DEFAULT_AVATAR_COLOR,
  resolveAvatar,
  isLightColor,
} from './avatar';

describe('avatar · constantes', () => {
  it('tiene 40 emojis curados', () => {
    expect(AVATAR_EMOJIS.length).toBe(40);
  });

  it('tiene 25 colores (grid 5x5)', () => {
    expect(AVATAR_COLORS.length).toBe(25);
  });

  it('los emojis son únicos', () => {
    const set = new Set(AVATAR_EMOJIS);
    expect(set.size).toBe(AVATAR_EMOJIS.length);
  });

  it('los colores son únicos', () => {
    const set = new Set(AVATAR_COLORS);
    expect(set.size).toBe(AVATAR_COLORS.length);
  });

  it('todos los colores son hex válidos', () => {
    for (const color of AVATAR_COLORS) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('defaults son sensatos', () => {
    expect(DEFAULT_AVATAR_EMOJI).toBe('😀');
    expect(DEFAULT_AVATAR_COLOR).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

describe('resolveAvatar', () => {
  it('regresa defaults para input null', () => {
    expect(resolveAvatar(null)).toEqual({
      emoji: DEFAULT_AVATAR_EMOJI,
      color: DEFAULT_AVATAR_COLOR,
    });
  });

  it('regresa defaults para input undefined', () => {
    expect(resolveAvatar(undefined)).toEqual({
      emoji: DEFAULT_AVATAR_EMOJI,
      color: DEFAULT_AVATAR_COLOR,
    });
  });

  it('regresa defaults para objeto vacío', () => {
    expect(resolveAvatar({})).toEqual({
      emoji: DEFAULT_AVATAR_EMOJI,
      color: DEFAULT_AVATAR_COLOR,
    });
  });

  it('regresa defaults para campos null', () => {
    expect(resolveAvatar({ emoji: null, color: null })).toEqual({
      emoji: DEFAULT_AVATAR_EMOJI,
      color: DEFAULT_AVATAR_COLOR,
    });
  });

  it('respeta el emoji custom', () => {
    expect(resolveAvatar({ emoji: '🦊', color: null })).toEqual({
      emoji: '🦊',
      color: DEFAULT_AVATAR_COLOR,
    });
  });

  it('respeta el color custom', () => {
    expect(resolveAvatar({ emoji: null, color: '#FF0000' })).toEqual({
      emoji: DEFAULT_AVATAR_EMOJI,
      color: '#FF0000',
    });
  });

  it('respeta ambos campos custom', () => {
    expect(resolveAvatar({ emoji: '🌸', color: '#A8709E' })).toEqual({
      emoji: '🌸',
      color: '#A8709E',
    });
  });
});

describe('isLightColor', () => {
  it('detecta blanco como claro', () => {
    expect(isLightColor('#FFFFFF')).toBe(true);
  });

  it('detecta negro como oscuro', () => {
    expect(isLightColor('#000000')).toBe(false);
  });

  it('detecta amarillo pálido como claro', () => {
    expect(isLightColor('#FFF3CC')).toBe(true);
  });

  it('detecta terracotta saturado como oscuro', () => {
    expect(isLightColor('#E0654B')).toBe(false);
  });

  it('detecta verde oscuro como oscuro', () => {
    expect(isLightColor('#5A7A47')).toBe(false);
  });

  it('detecta beige claro como claro', () => {
    expect(isLightColor('#FBE5DC')).toBe(true);
  });

  it('acepta hex sin # prefix', () => {
    expect(isLightColor('FFFFFF')).toBe(true);
    expect(isLightColor('000000')).toBe(false);
  });
});
