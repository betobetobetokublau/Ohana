import type { MoodEmocion } from '@/lib/types';

export type MoodOption = {
  key: MoodEmocion;
  emoji: string;
  label: string;
  tone: 'positive' | 'neutral' | 'negative';
};

/**
 * Set curado de 8 emojis (PRD v1.2 §11.3).
 * Uno por emoción · 3 positivos / 1 neutro / 4 negativos.
 */
export const MOOD_OPTIONS: MoodOption[] = [
  { key: 'carinoso',  emoji: '🥰', label: 'Cariñoso',  tone: 'positive' },
  { key: 'feliz',     emoji: '😊', label: 'Feliz',     tone: 'positive' },
  { key: 'tranquilo', emoji: '😌', label: 'Tranquilo', tone: 'positive' },
  { key: 'neutral',   emoji: '😐', label: 'Neutral',   tone: 'neutral' },
  { key: 'agotado',   emoji: '😴', label: 'Agotado',   tone: 'negative' },
  { key: 'ansioso',   emoji: '😰', label: 'Ansioso',   tone: 'negative' },
  { key: 'triste',    emoji: '😔', label: 'Triste',    tone: 'negative' },
  { key: 'frustrado', emoji: '😤', label: 'Frustrado', tone: 'negative' },
];

export const moodByKey: Record<MoodEmocion, MoodOption> = Object.fromEntries(
  MOOD_OPTIONS.map(m => [m.key, m])
) as Record<MoodEmocion, MoodOption>;

/**
 * Punto de mood capturado. Subset mínimo necesario para análisis.
 */
export type MoodPoint = {
  emocion: MoodEmocion;
  created_at: string;
};

/**
 * Calcula el mood "dominante" de un set de capturas (típicamente del mismo día).
 *
 * Reglas:
 *  1. Set vacío → null
 *  2. Una captura → esa
 *  3. Múltiples → la emoción más frecuente.
 *     Si hay empate en frecuencia → la captura más reciente entre las candidatas.
 *
 * Usado en el heatmap del módulo Mood (PRD v1.2 §11.6).
 */
export function dominantMood<T extends MoodPoint>(moods: T[]): T | null {
  if (moods.length === 0) return null;
  if (moods.length === 1) return moods[0]!;

  // Contar frecuencia por emoción
  const counts = new Map<MoodEmocion, number>();
  for (const m of moods) {
    counts.set(m.emocion, (counts.get(m.emocion) ?? 0) + 1);
  }

  // Encontrar la max frecuencia
  const maxCount = Math.max(...counts.values());
  const candidates = new Set(
    Array.from(counts.entries())
      .filter(([, c]) => c === maxCount)
      .map(([e]) => e)
  );

  // De las candidatas (más frecuentes), regresa la más reciente.
  // Ordenamos por created_at desc.
  const sortedDesc = [...moods].sort(
    (a, b) => b.created_at.localeCompare(a.created_at)
  );
  return sortedDesc.find(m => candidates.has(m.emocion)) ?? moods[moods.length - 1]!;
}
