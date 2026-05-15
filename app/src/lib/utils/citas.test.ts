import { describe, it, expect } from 'vitest';
import { detectConsensus, bothHaveVoted } from './citas';

describe('detectConsensus · overlap de votos (PRD §6.1.3)', () => {
  it('un overlap → regresa esa idea', () => {
    expect(detectConsensus(['a', 'b'], ['b', 'c'])).toBe('b');
  });

  it('múltiples overlaps → regresa el primero del orden de myVotes', () => {
    expect(detectConsensus(['a', 'b'], ['b', 'a'])).toBe('a');
  });

  it('sin overlap → null', () => {
    expect(detectConsensus(['a', 'b'], ['c', 'd'])).toBeNull();
  });

  it('mis votos vacíos → null', () => {
    expect(detectConsensus([], ['a', 'b'])).toBeNull();
  });

  it('votos de pareja vacíos → null (aún no votó)', () => {
    expect(detectConsensus(['a', 'b'], [])).toBeNull();
  });

  it('ambos vacíos → null', () => {
    expect(detectConsensus([], [])).toBeNull();
  });

  it('ambos idénticos → regresa el primero', () => {
    expect(detectConsensus(['a', 'b'], ['a', 'b'])).toBe('a');
  });

  it('determinístico · misma input → mismo output', () => {
    const a = detectConsensus(['x', 'y', 'z'], ['z', 'y']);
    const b = detectConsensus(['x', 'y', 'z'], ['z', 'y']);
    expect(a).toBe(b);
  });
});

describe('bothHaveVoted', () => {
  it('ambos con votos → true', () => {
    expect(bothHaveVoted(['a'], ['b'])).toBe(true);
  });

  it('solo uno votó → false', () => {
    expect(bothHaveVoted(['a'], [])).toBe(false);
    expect(bothHaveVoted([], ['b'])).toBe(false);
  });

  it('ninguno votó → false', () => {
    expect(bothHaveVoted([], [])).toBe(false);
  });
});
