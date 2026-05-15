import { describe, it, expect } from 'vitest';
import { orderAlternating } from './mimos';

type M = { autor_id: string; id: string };

describe('orderAlternating · ritual mensual de Mimos', () => {
  it('input vacío → array vacío', () => {
    expect(orderAlternating<M>([], 'A', 'B')).toEqual([]);
  });

  it('all mine, none from partner → todos mine en orden', () => {
    const mimos: M[] = [
      { autor_id: 'A', id: 'a1' },
      { autor_id: 'A', id: 'a2' },
      { autor_id: 'A', id: 'a3' },
    ];
    const result = orderAlternating(mimos, 'A', 'B');
    expect(result.map(m => m.id)).toEqual(['a1', 'a2', 'a3']);
  });

  it('all partner, none mine → todos del partner en orden', () => {
    const mimos: M[] = [
      { autor_id: 'B', id: 'b1' },
      { autor_id: 'B', id: 'b2' },
    ];
    const result = orderAlternating(mimos, 'A', 'B');
    expect(result.map(m => m.id)).toEqual(['b1', 'b2']);
  });

  it('balance perfecto 3+3 · alterna empezando con míos (empate)', () => {
    const mimos: M[] = [
      { autor_id: 'A', id: 'a1' },
      { autor_id: 'A', id: 'a2' },
      { autor_id: 'A', id: 'a3' },
      { autor_id: 'B', id: 'b1' },
      { autor_id: 'B', id: 'b2' },
      { autor_id: 'B', id: 'b3' },
    ];
    const result = orderAlternating(mimos, 'A', 'B');
    expect(result.map(m => m.id)).toEqual(['a1', 'b1', 'a2', 'b2', 'a3', 'b3']);
  });

  it('desbalance 2+4 · empieza el de menos, los extras al final', () => {
    const mimos: M[] = [
      { autor_id: 'A', id: 'a1' },
      { autor_id: 'A', id: 'a2' },
      { autor_id: 'B', id: 'b1' },
      { autor_id: 'B', id: 'b2' },
      { autor_id: 'B', id: 'b3' },
      { autor_id: 'B', id: 'b4' },
    ];
    const result = orderAlternating(mimos, 'A', 'B');
    // A empieza (menos), alterna mientras puede, después solo B
    expect(result.map(m => m.id)).toEqual(['a1', 'b1', 'a2', 'b2', 'b3', 'b4']);
  });

  it('desbalance 5+2 · partner empieza (menos), míos al final', () => {
    const mimos: M[] = [
      { autor_id: 'A', id: 'a1' },
      { autor_id: 'A', id: 'a2' },
      { autor_id: 'A', id: 'a3' },
      { autor_id: 'A', id: 'a4' },
      { autor_id: 'A', id: 'a5' },
      { autor_id: 'B', id: 'b1' },
      { autor_id: 'B', id: 'b2' },
    ];
    const result = orderAlternating(mimos, 'A', 'B');
    expect(result.map(m => m.id)).toEqual(['b1', 'a1', 'b2', 'a2', 'a3', 'a4', 'a5']);
  });

  it('un solo mimo (mío) · no rompe', () => {
    const result = orderAlternating([{ autor_id: 'A', id: 'a1' }], 'A', 'B');
    expect(result.map(m => m.id)).toEqual(['a1']);
  });

  it('preserva el orden original dentro de cada autor', () => {
    const mimos: M[] = [
      { autor_id: 'A', id: 'a-first' },
      { autor_id: 'A', id: 'a-second' },
      { autor_id: 'B', id: 'b-first' },
      { autor_id: 'B', id: 'b-second' },
    ];
    const result = orderAlternating(mimos, 'A', 'B');
    // Mismo orden interno · solo entrelazado
    expect(result.map(m => m.id)).toEqual(['a-first', 'b-first', 'a-second', 'b-second']);
  });

  it('mimos con autores fuera del couple son ignorados', () => {
    const mimos: M[] = [
      { autor_id: 'A', id: 'a1' },
      { autor_id: 'C', id: 'stranger' },
      { autor_id: 'B', id: 'b1' },
    ];
    const result = orderAlternating(mimos, 'A', 'B');
    expect(result.map(m => m.id)).toEqual(['a1', 'b1']);
  });

  it('output length conserva los del couple', () => {
    const mimos: M[] = [
      { autor_id: 'A', id: 'a1' },
      { autor_id: 'A', id: 'a2' },
      { autor_id: 'B', id: 'b1' },
    ];
    const result = orderAlternating(mimos, 'A', 'B');
    expect(result.length).toBe(3);
  });
});
