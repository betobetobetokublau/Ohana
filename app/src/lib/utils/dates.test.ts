import { describe, it, expect } from 'vitest';
import { fmtRel, fmtDate, fmtDateShort, fmtWeekOf, greeting } from './dates';

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
