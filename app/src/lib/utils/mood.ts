import type { MoodEmocion } from '@/types/database';

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
