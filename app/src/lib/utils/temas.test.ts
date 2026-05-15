import { describe, it, expect } from 'vitest';
import {
  TEMA_PRIORIDADES,
  PRIORIDAD_BADGE,
  TEMA_ESTADO_VARIANT,
  PRIORIDAD_ORDER,
  resolvePrioridad,
  compareTemas,
} from './temas';

describe('temas · constantes', () => {
  it('tiene 4 prioridades en orden lógico', () => {
    expect(TEMA_PRIORIDADES).toEqual(['baja', 'media', 'alta', 'urgente']);
  });

  it('todas las prioridades tienen badge', () => {
    for (const prio of TEMA_PRIORIDADES) {
      expect(PRIORIDAD_BADGE[prio]).toBeDefined();
      expect(PRIORIDAD_BADGE[prio].label).toBeTruthy();
      expect(PRIORIDAD_BADGE[prio].color).toMatch(/^hsl\(/);
    }
  });

  it('todos los estados de tema tienen variant', () => {
    expect(TEMA_ESTADO_VARIANT.abierto).toBe('accent');
    expect(TEMA_ESTADO_VARIANT.en_discusion).toBe('default');
    expect(TEMA_ESTADO_VARIANT.resuelto).toBe('success');
    expect(TEMA_ESTADO_VARIANT.archivado).toBe('default');
  });

  it('PRIORIDAD_ORDER · urgente arriba (0), baja abajo (3)', () => {
    expect(PRIORIDAD_ORDER.urgente).toBe(0);
    expect(PRIORIDAD_ORDER.alta).toBe(1);
    expect(PRIORIDAD_ORDER.media).toBe(2);
    expect(PRIORIDAD_ORDER.baja).toBe(3);
  });
});

describe('resolvePrioridad', () => {
  it('retorna media para null', () => {
    expect(resolvePrioridad(null)).toBe('media');
  });

  it('retorna media para undefined', () => {
    expect(resolvePrioridad(undefined)).toBe('media');
  });

  it('retorna media para empty string', () => {
    expect(resolvePrioridad('')).toBe('media');
  });

  it('retorna media para valor inválido', () => {
    expect(resolvePrioridad('inventada')).toBe('media');
    expect(resolvePrioridad('high')).toBe('media');
  });

  it('respeta valores válidos', () => {
    expect(resolvePrioridad('baja')).toBe('baja');
    expect(resolvePrioridad('media')).toBe('media');
    expect(resolvePrioridad('alta')).toBe('alta');
    expect(resolvePrioridad('urgente')).toBe('urgente');
  });
});

describe('compareTemas · sort', () => {
  function t(prioridad: string | null, created_at: string) {
    return { prioridad, created_at };
  }

  it('urgente antes que alta', () => {
    expect(compareTemas(t('urgente', '2026-01-01'), t('alta', '2026-01-01'))).toBeLessThan(0);
  });

  it('alta antes que media', () => {
    expect(compareTemas(t('alta', '2026-01-01'), t('media', '2026-01-01'))).toBeLessThan(0);
  });

  it('media antes que baja', () => {
    expect(compareTemas(t('media', '2026-01-01'), t('baja', '2026-01-01'))).toBeLessThan(0);
  });

  it('misma prioridad · más reciente primero', () => {
    const reciente = t('alta', '2026-05-14');
    const viejo = t('alta', '2026-01-01');
    expect(compareTemas(reciente, viejo)).toBeLessThan(0);
    expect(compareTemas(viejo, reciente)).toBeGreaterThan(0);
  });

  it('misma prioridad y fecha → empate', () => {
    expect(compareTemas(t('alta', '2026-01-01'), t('alta', '2026-01-01'))).toBe(0);
  });

  it('null prioridad se trata como media', () => {
    // null = media, debe quedar entre alta y baja
    expect(compareTemas(t('alta', '2026-01-01'), t(null, '2026-01-01'))).toBeLessThan(0);
    expect(compareTemas(t(null, '2026-01-01'), t('baja', '2026-01-01'))).toBeLessThan(0);
  });

  it('ordena correctamente una lista mixta', () => {
    const list = [
      t('baja', '2026-05-01'),
      t('urgente', '2026-01-01'),
      t('media', '2026-04-01'),
      t('alta', '2026-03-01'),
      t('alta', '2026-05-10'),
    ];
    const sorted = [...list].sort(compareTemas);
    // urgente, alta (más reciente), alta (más viejo), media, baja
    expect(sorted.map(s => s.prioridad)).toEqual(['urgente', 'alta', 'alta', 'media', 'baja']);
    // Las dos altas deben estar ordenadas por fecha desc
    expect(sorted[1]?.created_at).toBe('2026-05-10');
    expect(sorted[2]?.created_at).toBe('2026-03-01');
  });
});
