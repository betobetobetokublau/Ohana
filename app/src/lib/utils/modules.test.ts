import { describe, it, expect } from 'vitest';
import {
  ACCIONABLE_COLOR,
  MODULE_COLOR,
  ACUERDO_CATEGORIA_COLOR,
  ACUERDO_CATEGORIA_LABEL,
  accionableColor,
} from './modules';

describe('ACCIONABLE_COLOR · mapa de tipos transversales', () => {
  it('cubre los 7 tipos del PRD', () => {
    expect(Object.keys(ACCIONABLE_COLOR).sort()).toEqual([
      'discusion',
      'mantenimiento',
      'pago',
      'proyecto',
      'revision',
      'saludsexual',
      'viaje',
    ]);
  });

  it('todos los valores son CSS hsl con var()', () => {
    Object.values(ACCIONABLE_COLOR).forEach(c => {
      expect(c).toMatch(/^hsl\(var\(--mod-/);
    });
  });

  it('revision y saludsexual comparten color (mismo módulo)', () => {
    expect(ACCIONABLE_COLOR.revision).toBe(ACCIONABLE_COLOR.saludsexual);
  });
});

describe('accionableColor · helper con fallback', () => {
  it('regresa el color correcto para tipo conocido', () => {
    expect(accionableColor('pago')).toBe(ACCIONABLE_COLOR.pago);
    expect(accionableColor('mantenimiento')).toBe(ACCIONABLE_COLOR.mantenimiento);
  });

  it('regresa ink color para tipo desconocido (fallback)', () => {
    expect(accionableColor('cualquier-otra-cosa')).toBe(MODULE_COLOR.ink);
    expect(accionableColor('')).toBe(MODULE_COLOR.ink);
  });
});

describe('MODULE_COLOR · paleta completa', () => {
  it('expone los 10 módulos visuales del PRD', () => {
    expect(Object.keys(MODULE_COLOR).sort()).toEqual([
      'citas',
      'discusiones',
      'fechas',
      'gastos',
      'ink',
      'mantenimiento',
      'mimos',
      'proyectos',
      'salud',
      'viajes',
    ]);
  });

  it('mimos comparte color con accent terracotta', () => {
    // ambos resuelven al accent color via CSS var
    expect(MODULE_COLOR.mimos).toBe('hsl(var(--mod-mimos))');
  });
});

describe('ACUERDO_CATEGORIA_LABEL · etiquetas en español', () => {
  it('cubre las 7 categorías del PRD §6.10', () => {
    expect(Object.keys(ACUERDO_CATEGORIA_LABEL).sort()).toEqual([
      'comunicacion',
      'dinero',
      'familia',
      'hogar',
      'intimidad',
      'otros',
      'tiempo',
    ]);
  });

  it('comunicación tiene tilde correcta', () => {
    expect(ACUERDO_CATEGORIA_LABEL.comunicacion).toBe('Comunicación');
  });

  it('todas las labels son capitalizadas', () => {
    Object.values(ACUERDO_CATEGORIA_LABEL).forEach(label => {
      expect(label[0]).toBe(label[0]?.toUpperCase());
    });
  });
});

describe('ACUERDO_CATEGORIA_COLOR · mapping a colores de módulo', () => {
  it('comunicación usa el color de discusiones', () => {
    expect(ACUERDO_CATEGORIA_COLOR.comunicacion).toBe(MODULE_COLOR.discusiones);
  });

  it('hogar usa el color de mantenimiento', () => {
    expect(ACUERDO_CATEGORIA_COLOR.hogar).toBe(MODULE_COLOR.mantenimiento);
  });

  it('intimidad usa el color de salud', () => {
    expect(ACUERDO_CATEGORIA_COLOR.intimidad).toBe(MODULE_COLOR.salud);
  });

  it('cubre las mismas keys que LABEL', () => {
    expect(Object.keys(ACUERDO_CATEGORIA_COLOR).sort()).toEqual(
      Object.keys(ACUERDO_CATEGORIA_LABEL).sort()
    );
  });
});
