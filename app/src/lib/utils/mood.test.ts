import { describe, it, expect } from 'vitest';
import { MOOD_OPTIONS, moodByKey, dominantMood } from './mood';

describe('MOOD_OPTIONS · set curado v1.2', () => {
  it('tiene exactamente 8 opciones (PRD §11.3)', () => {
    expect(MOOD_OPTIONS).toHaveLength(8);
  });

  it('cada key es único · uno por emoción', () => {
    const keys = MOOD_OPTIONS.map(m => m.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('cada emoji es único · no hay dos emojis para la misma emoción', () => {
    const emojis = MOOD_OPTIONS.map(m => m.emoji);
    expect(new Set(emojis).size).toBe(emojis.length);
  });

  it('balance · 3 positivos / 1 neutro / 4 negativos', () => {
    const tones = MOOD_OPTIONS.map(m => m.tone);
    expect(tones.filter(t => t === 'positive')).toHaveLength(3);
    expect(tones.filter(t => t === 'neutral')).toHaveLength(1);
    expect(tones.filter(t => t === 'negative')).toHaveLength(4);
  });

  it('incluye las 8 emociones canónicas', () => {
    const keys = MOOD_OPTIONS.map(m => m.key);
    expect(keys).toEqual([
      'carinoso', 'feliz', 'tranquilo', 'neutral',
      'agotado', 'ansioso', 'triste', 'frustrado',
    ]);
  });

  it('todas tienen label en español', () => {
    MOOD_OPTIONS.forEach(m => {
      expect(m.label).toBeTruthy();
      expect(typeof m.label).toBe('string');
      expect(m.label.length).toBeGreaterThan(0);
    });
  });
});

describe('moodByKey · lookup map', () => {
  it('expone todas las 8 emociones', () => {
    expect(Object.keys(moodByKey)).toHaveLength(8);
  });

  it('lookup funcional', () => {
    expect(moodByKey.carinoso.emoji).toBe('🥰');
    expect(moodByKey.feliz.label).toBe('Feliz');
    expect(moodByKey.frustrado.tone).toBe('negative');
  });
});

describe('dominantMood · algoritmo del heatmap (PRD §11.6)', () => {
  it('set vacío → null', () => {
    expect(dominantMood([])).toBeNull();
  });

  it('una sola captura → esa captura', () => {
    const point = { emocion: 'feliz' as const, created_at: '2026-05-14T10:00:00Z' };
    expect(dominantMood([point])).toBe(point);
  });

  it('múltiples capturas mismo día · gana la más frecuente', () => {
    const points = [
      { emocion: 'ansioso' as const, created_at: '2026-05-14T08:00:00Z' },
      { emocion: 'feliz' as const,   created_at: '2026-05-14T10:00:00Z' },
      { emocion: 'feliz' as const,   created_at: '2026-05-14T14:00:00Z' },
      { emocion: 'feliz' as const,   created_at: '2026-05-14T18:00:00Z' },
    ];
    expect(dominantMood(points)?.emocion).toBe('feliz');
  });

  it('empate en frecuencia · gana la más reciente entre las empatadas', () => {
    // 2 ansioso, 2 feliz · ambos empatan
    const points = [
      { emocion: 'ansioso' as const, created_at: '2026-05-14T08:00:00Z' },
      { emocion: 'feliz' as const,   created_at: '2026-05-14T10:00:00Z' },
      { emocion: 'ansioso' as const, created_at: '2026-05-14T12:00:00Z' },
      { emocion: 'feliz' as const,   created_at: '2026-05-14T15:00:00Z' },
    ];
    // El más reciente es feliz a las 15:00 → feliz gana
    const result = dominantMood(points);
    expect(result?.emocion).toBe('feliz');
    expect(result?.created_at).toBe('2026-05-14T15:00:00Z');
  });

  it('empate · si el más reciente NO está en las empatadas, ignora ese', () => {
    // 2 frustrado, 2 tranquilo (empate), + 1 feliz al final (no empata, frecuencia 1)
    const points = [
      { emocion: 'frustrado' as const, created_at: '2026-05-14T08:00:00Z' },
      { emocion: 'tranquilo' as const, created_at: '2026-05-14T10:00:00Z' },
      { emocion: 'frustrado' as const, created_at: '2026-05-14T12:00:00Z' },
      { emocion: 'tranquilo' as const, created_at: '2026-05-14T14:00:00Z' },
      { emocion: 'feliz' as const,     created_at: '2026-05-14T20:00:00Z' },
    ];
    // Feliz (1) no compite. Entre frustrado (2) y tranquilo (2), gana el más reciente.
    // tranquilo última fue 14:00, frustrado última fue 12:00 → tranquilo gana
    const result = dominantMood(points);
    expect(result?.emocion).toBe('tranquilo');
    expect(result?.created_at).toBe('2026-05-14T14:00:00Z');
  });

  it('orden de input no afecta el resultado', () => {
    const a = { emocion: 'feliz' as const, created_at: '2026-05-14T10:00:00Z' };
    const b = { emocion: 'feliz' as const, created_at: '2026-05-14T14:00:00Z' };
    const c = { emocion: 'agotado' as const, created_at: '2026-05-14T18:00:00Z' };
    expect(dominantMood([a, b, c])?.emocion).toBe('feliz');
    expect(dominantMood([c, b, a])?.emocion).toBe('feliz');
    expect(dominantMood([b, c, a])?.emocion).toBe('feliz');
  });

  it('determinístico · misma input siempre regresa misma output', () => {
    const points = [
      { emocion: 'feliz' as const, created_at: '2026-05-14T10:00:00Z' },
      { emocion: 'triste' as const, created_at: '2026-05-14T14:00:00Z' },
    ];
    const r1 = dominantMood(points);
    const r2 = dominantMood(points);
    expect(r1).toEqual(r2);
  });
});
