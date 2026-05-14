import { describe, it, expect } from 'vitest';
import { sidebarNav, bottomNav } from './nav';

describe('sidebarNav · navegación iPad/web', () => {
  it('tiene 4 grupos por intención', () => {
    expect(sidebarNav).toHaveLength(4);
  });

  it('grupos en orden correcto · Hoy / Rituales / Conversación / Logística', () => {
    expect(sidebarNav.map(g => g.label)).toEqual([
      'Hoy', 'Rituales', 'Conversación', 'Logística',
    ]);
  });

  it('cada item tiene href, label, glyph', () => {
    sidebarNav.flatMap(g => g.items).forEach(item => {
      expect(item.href).toMatch(/^\//);
      expect(item.label).toBeTruthy();
      expect(item.glyph).toBeTruthy();
      expect(item.glyph.length).toBeGreaterThan(0);
    });
  });

  it('hrefs únicos · sin duplicados entre grupos', () => {
    const hrefs = sidebarNav.flatMap(g => g.items.map(i => i.href));
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('grupo Rituales contiene los 5 rituales del PRD v1.2', () => {
    const rituales = sidebarNav.find(g => g.label === 'Rituales');
    expect(rituales).toBeDefined();
    const labels = rituales!.items.map(i => i.label);
    expect(labels).toContain('Citas');
    expect(labels).toContain('Mimos');
    expect(labels).toContain('Checkin');
    expect(labels).toContain('Mood');
    expect(labels).toContain('Resumen');
  });

  it('grupo Logística contiene los 6 módulos operativos', () => {
    const logistica = sidebarNav.find(g => g.label === 'Logística');
    expect(logistica).toBeDefined();
    expect(logistica!.items).toHaveLength(6);
  });
});

describe('bottomNav · navegación móvil', () => {
  it('tiene exactamente 5 tabs', () => {
    expect(bottomNav).toHaveLength(5);
  });

  it('tabs en orden correcto · Hoy / Capturar / Citas / Conversar / Yo', () => {
    expect(bottomNav.map(i => i.label)).toEqual([
      'Hoy', 'Capturar', 'Citas', 'Conversar', 'Yo',
    ]);
  });

  it('cada tab tiene href y glyph', () => {
    bottomNav.forEach(item => {
      expect(item.href).toMatch(/^\//);
      expect(item.glyph).toBeTruthy();
    });
  });
});
