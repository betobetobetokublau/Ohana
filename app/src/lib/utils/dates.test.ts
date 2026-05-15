import { describe, it, expect } from 'vitest';
import { fmtRel, fmtDate, fmtDateShort, fmtWeekOf, greeting, nextAnnualOccurrence } from './dates';

describe('fmtRel · fecha relativa en español', () => {
  const now = new Date('2026-05-14T12:00:00');

  it('hoy', () => {
    expect(fmtRel(new Date('2026-05-14T08:00:00'), now)).toBe('hoy');
  });

  it('mañana', () => {
    expect(fmtRel(new Date('2026-05-15T08:00:00'), now)).toBe('mañana');
  });

  it('ayer', () => {
    expect(fmtRel(new Date('2026-05-13T08:00:00'), now)).toBe('ayer');
  });

  it('en X días (futuro, ventana 14 días)', () => {
    expect(fmtRel(new Date('2026-05-19T08:00:00'), now)).toBe('en 5 días');
    expect(fmtRel(new Date('2026-05-21T08:00:00'), now)).toBe('en 7 días');
  });

  it('hace X días (pasado, ventana 14 días)', () => {
    expect(fmtRel(new Date('2026-05-10T08:00:00'), now)).toBe('hace 4 días');
  });

  it('fuera de ventana de 14 días · usa fecha formateada', () => {
    expect(fmtRel(new Date('2026-06-15T08:00:00'), now)).toMatch(/jun/i);
    expect(fmtRel(new Date('2026-04-01T08:00:00'), now)).toMatch(/abr/i);
  });

  it('acepta string ISO', () => {
    expect(fmtRel('2026-05-14T08:00:00', now)).toBe('hoy');
  });
});

describe('fmtDate · formato configurable', () => {
  it('default pattern · día de semana + día + mes', () => {
    const result = fmtDate('2026-05-09');
    expect(result.toLowerCase()).toContain('may');
  });

  it('pattern custom · solo año', () => {
    expect(fmtDate('2026-05-09', 'yyyy')).toBe('2026');
  });
});

describe('fmtDateShort', () => {
  it('formato d MMM', () => {
    const result = fmtDateShort('2026-05-09');
    expect(result).toMatch(/9.*may/i);
  });
});

describe('fmtWeekOf · lunes de la semana actual', () => {
  it('miércoles → lunes anterior', () => {
    // 2026-05-13 es miércoles · lunes es 2026-05-11
    expect(fmtWeekOf('2026-05-13')).toBe('2026-05-11');
  });

  it('domingo → lunes anterior (no el siguiente)', () => {
    // 2026-05-17 es domingo · lunes es 2026-05-11
    expect(fmtWeekOf('2026-05-17')).toBe('2026-05-11');
  });

  it('lunes → mismo día', () => {
    expect(fmtWeekOf('2026-05-11')).toBe('2026-05-11');
  });
});

describe('nextAnnualOccurrence · próxima ocurrencia anual', () => {
  it('aniversario en el futuro este año → este año', () => {
    const now = new Date(2026, 4, 1); // 1 mayo
    const result = nextAnnualOccurrence('2022-05-19', now);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(4);
    expect(result.getDate()).toBe(19);
  });

  it('aniversario ya pasó este año → próximo año', () => {
    const now = new Date(2026, 5, 1); // 1 junio
    const result = nextAnnualOccurrence('2022-05-19', now);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth()).toBe(4);
    expect(result.getDate()).toBe(19);
  });

  it('aniversario es hoy → hoy', () => {
    const now = new Date(2026, 4, 19);
    const result = nextAnnualOccurrence('2022-05-19', now);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getDate()).toBe(19);
  });

  it('aniversario fue ayer → próximo año', () => {
    const now = new Date(2026, 4, 20);
    const result = nextAnnualOccurrence('2022-05-19', now);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getDate()).toBe(19);
  });

  it('29 feb · año bisiesto → 29 feb', () => {
    const now = new Date(2028, 0, 1); // enero 2028 (2028 es bisiesto)
    const result = nextAnnualOccurrence('2020-02-29', now);
    expect(result.getFullYear()).toBe(2028);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(29);
  });

  it('29 feb · año NO bisiesto → 28 feb (no se va a 1 marzo)', () => {
    const now = new Date(2027, 0, 1); // enero 2027 (no bisiesto)
    const result = nextAnnualOccurrence('2020-02-29', now);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth()).toBe(1); // febrero
    expect(result.getDate()).toBe(28);
  });

  it('acepta Date como input', () => {
    const now = new Date(2026, 0, 1);
    const result = nextAnnualOccurrence(new Date(2022, 11, 25), now);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(11);
    expect(result.getDate()).toBe(25);
  });

  it('isLeapYear · cubre 2000 (sí) y 2100 (no)', () => {
    // 2000 es divisible entre 400 → bisiesto
    const result2000 = nextAnnualOccurrence('1996-02-29', new Date(2000, 0, 1));
    expect(result2000.getDate()).toBe(29);
    // 2100 es divisible entre 100 pero no 400 → NO bisiesto
    const result2100 = nextAnnualOccurrence('1996-02-29', new Date(2100, 0, 1));
    expect(result2100.getDate()).toBe(28);
  });
});

describe('greeting · saludo por hora del día', () => {
  it('antes de mediodía · buenos días', () => {
    expect(greeting(new Date('2026-05-14T08:00:00'))).toBe('Buenos días');
    expect(greeting(new Date('2026-05-14T11:59:00'))).toBe('Buenos días');
  });

  it('tarde · buenas tardes', () => {
    expect(greeting(new Date('2026-05-14T12:00:00'))).toBe('Buenas tardes');
    expect(greeting(new Date('2026-05-14T18:59:00'))).toBe('Buenas tardes');
  });

  it('noche · buenas noches', () => {
    expect(greeting(new Date('2026-05-14T19:00:00'))).toBe('Buenas noches');
    expect(greeting(new Date('2026-05-14T23:30:00'))).toBe('Buenas noches');
  });
});
