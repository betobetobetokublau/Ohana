import { describe, it, expect } from 'vitest';
import { expandRecurrence, parseDbDate } from './calendar-events';

describe('expandRecurrence', () => {
  it('sin recurrencia · fecha en rango → array con esa fecha', () => {
    const result = expandRecurrence(
      new Date(2026, 4, 15),
      null,
      new Date(2026, 4, 1),
      new Date(2026, 4, 31)
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.getDate()).toBe(15);
  });

  it('sin recurrencia · fecha fuera de rango → array vacío', () => {
    const result = expandRecurrence(
      new Date(2026, 3, 1),
      null,
      new Date(2026, 4, 1),
      new Date(2026, 4, 31)
    );
    expect(result).toHaveLength(0);
  });

  it('mensual · genera todas las ocurrencias del año', () => {
    const result = expandRecurrence(
      new Date(2026, 0, 15), // 15 enero 2026
      { value: 1, unit: 'months' },
      new Date(2026, 0, 1),
      new Date(2026, 11, 31)
    );
    expect(result).toHaveLength(12);
  });

  it('semanal · cada 2 semanas en un mes', () => {
    const result = expandRecurrence(
      new Date(2026, 4, 1),
      { value: 2, unit: 'weeks' },
      new Date(2026, 4, 1),
      new Date(2026, 4, 31)
    );
    // 1 may, 15 may, 29 may = 3 ocurrencias
    expect(result).toHaveLength(3);
  });

  it('fecha base anterior al rango · solo cuenta ocurrencias DENTRO del rango', () => {
    const result = expandRecurrence(
      new Date(2025, 0, 15), // empieza enero 2025
      { value: 1, unit: 'months' }, // cada mes
      new Date(2026, 4, 1),
      new Date(2026, 4, 31)
    );
    // Una sola ocurrencia: 15 mayo 2026
    expect(result).toHaveLength(1);
    expect(result[0]!.getMonth()).toBe(4);
    expect(result[0]!.getFullYear()).toBe(2026);
  });

  it('anual · aniversario aparece una vez al año', () => {
    const result = expandRecurrence(
      new Date(2022, 4, 19), // aniversario original
      { value: 1, unit: 'years' },
      new Date(2026, 0, 1),
      new Date(2028, 11, 31)
    );
    expect(result).toHaveLength(3); // 2026, 2027, 2028
  });

  it('respeta maxOccurrences', () => {
    const result = expandRecurrence(
      new Date(2026, 0, 1),
      { value: 1, unit: 'days' },
      new Date(2026, 0, 1),
      new Date(2030, 0, 1),
      50
    );
    expect(result.length).toBeLessThanOrEqual(50);
  });
});

describe('parseDbDate', () => {
  it('YYYY-MM-DD · parsea como local sin shift', () => {
    const date = parseDbDate('2026-05-19');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(4);
    expect(date.getDate()).toBe(19);
  });

  it('ISO completo · usa parseISO', () => {
    const date = parseDbDate('2026-05-19T08:00:00.000Z');
    expect(date.getFullYear()).toBe(2026);
  });
});
