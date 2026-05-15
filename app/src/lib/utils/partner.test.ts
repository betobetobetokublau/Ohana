import { describe, it, expect } from 'vitest';
import { partnerOf, isUserA } from './partner';

describe('partnerOf · resolver pareja de un usuario en un couple', () => {
  it('user_a → regresa user_b', () => {
    const couple = { user_a_id: 'A', user_b_id: 'B' };
    expect(partnerOf(couple, 'A')).toBe('B');
  });

  it('user_b → regresa user_a', () => {
    const couple = { user_a_id: 'A', user_b_id: 'B' };
    expect(partnerOf(couple, 'B')).toBe('A');
  });

  it('couple sin partner (b=null) · regresa null', () => {
    const couple = { user_a_id: 'A', user_b_id: null };
    expect(partnerOf(couple, 'A')).toBeNull();
  });

  it('user no pertenece al couple · regresa null', () => {
    const couple = { user_a_id: 'A', user_b_id: 'B' };
    expect(partnerOf(couple, 'C')).toBeNull();
  });
});

describe('isUserA · determinar posición en couple', () => {
  it('user es user_a · true', () => {
    expect(isUserA({ user_a_id: 'A', user_b_id: 'B' }, 'A')).toBe(true);
  });

  it('user es user_b · false', () => {
    expect(isUserA({ user_a_id: 'A', user_b_id: 'B' }, 'B')).toBe(false);
  });

  it('user no es ninguno · false (no es user_a)', () => {
    expect(isUserA({ user_a_id: 'A', user_b_id: 'B' }, 'C')).toBe(false);
  });

  it('determinístico · no depende de side effects', () => {
    const couple = { user_a_id: 'X', user_b_id: 'Y' };
    expect(isUserA(couple, 'X')).toBe(true);
    expect(isUserA(couple, 'X')).toBe(true);
    expect(isUserA(couple, 'Y')).toBe(false);
  });
});
