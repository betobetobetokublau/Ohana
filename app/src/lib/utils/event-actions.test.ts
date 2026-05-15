import { describe, it, expect } from 'vitest';
import { canMarkAsDone, getDetailHref } from './event-actions';
import type { CalendarEvent } from '@/app/(app)/calendario/types';

function ev(type: CalendarEvent['type'], sourceId = 'abc-123'): CalendarEvent {
  return {
    id: 'fake',
    type,
    sourceId,
    label: 'fake',
    date: '2026-05-14',
    color: '#000',
    completed: false,
    variableUnfilled: false,
  };
}

describe('canMarkAsDone', () => {
  it('todos los tipos accionables son togglables', () => {
    expect(canMarkAsDone('pago')).toBe(true);
    expect(canMarkAsDone('mantenimiento')).toBe(true);
    expect(canMarkAsDone('proyecto')).toBe(true);
    expect(canMarkAsDone('viaje')).toBe(true);
    expect(canMarkAsDone('discusion')).toBe(true);
    expect(canMarkAsDone('saludsexual')).toBe(true);
    expect(canMarkAsDone('revision')).toBe(true);
  });

  it('citas no se marcan como hecho · simplemente ocurren', () => {
    expect(canMarkAsDone('cita')).toBe(false);
  });

  it('fechas-clave no se marcan como hecho', () => {
    expect(canMarkAsDone('fecha')).toBe(false);
  });
});

describe('getDetailHref', () => {
  it('proyectos y discusiones tienen detalle por id', () => {
    expect(getDetailHref(ev('proyecto', 'p1'))).toBe('/proyectos/p1');
    expect(getDetailHref(ev('discusion', 'd1'))).toBe('/discusiones/d1');
  });

  it('módulos sin detalle por id apuntan al listing', () => {
    expect(getDetailHref(ev('pago'))).toBe('/pagos');
    expect(getDetailHref(ev('mantenimiento'))).toBe('/mantenimiento');
    expect(getDetailHref(ev('viaje'))).toBe('/viajes');
    expect(getDetailHref(ev('cita'))).toBe('/citas/eventos');
    expect(getDetailHref(ev('fecha'))).toBe('/fechas-clave');
  });

  it('saludsexual y revision apuntan al módulo único', () => {
    expect(getDetailHref(ev('saludsexual'))).toBe('/salud-sexual');
    expect(getDetailHref(ev('revision'))).toBe('/salud-sexual');
  });
});
