import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn · class merger', () => {
  it('concatena strings simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('filtra valores falsy', () => {
    expect(cn('foo', null, undefined, false, 'bar')).toBe('foo bar');
  });

  it('soporta arrays anidados', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });

  it('soporta objeto de toggle', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });

  it('merge de Tailwind · conflicto de utilities pierde la primera', () => {
    // tailwind-merge resuelve esto: la última gana
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('merge respeta utilities no-conflictivas', () => {
    expect(cn('p-2', 'm-4')).toBe('p-2 m-4');
  });

  it('regresa string vacío con input vacío', () => {
    expect(cn()).toBe('');
    expect(cn(null, undefined)).toBe('');
  });
});
