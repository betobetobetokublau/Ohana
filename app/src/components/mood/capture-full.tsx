'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MOOD_OPTIONS } from '@/lib/utils/mood';
import { Button, Textarea, Scale10, EnumPicker } from '@/components/ui';
import type { MoodEmocion, PresionTrabajo } from '@/lib/types';
import { cn } from '@/lib/utils/cn';

const PRESION_OPTS: readonly PresionTrabajo[] = ['baja', 'mediana', 'alta', 'extrema'];

interface MoodCaptureFullProps {
  coupleId: string;
  userId: string;
  /**
   * Si goBackAfter es true, hace router.back() después de capturar (vuelve a la
   * página anterior). Si es false, se queda en /mood con un refresh.
   * Default: true (UX consistente con el quick-capture de Hoy).
   */
  goBackAfter?: boolean;
}

export function MoodCaptureFull({ coupleId, userId, goBackAfter = true }: MoodCaptureFullProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<MoodEmocion | null>(null);
  const [nota, setNota] = useState('');
  const [pending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState(false);

  // Extras opcionales (PRD §12)
  const [showEstres, setShowEstres] = useState(false);
  const [estres, setEstres] = useState<PresionTrabajo | null>(null);
  const [showEnergia, setShowEnergia] = useState(false);
  const [energia, setEnergia] = useState<number | null>(null);

  async function submit() {
    if (!selected) return;
    const supabase = createClient();
    await supabase.from('mood_checkins').insert({
      couple_id: coupleId,
      user_id: userId,
      emocion: selected,
      nota: buildNota(nota, estres, energia),
    });
    setConfirmed(true);

    if (goBackAfter) {
      // Mostrar confirm brevemente, luego volver a la página anterior
      setTimeout(() => router.back(), 800);
      return;
    }

    setTimeout(() => {
      setSelected(null);
      setNota('');
      setEstres(null);
      setEnergia(null);
      setShowEstres(false);
      setShowEnergia(false);
      setConfirmed(false);
      startTransition(() => router.refresh());
    }, 1200);
  }

  return (
    <div className="bg-surface border border-line rounded-md p-5 md:p-6">
      <div className="eyebrow mb-1">Captura ahora</div>
      <h2 className="font-serif text-2xl mt-1 mb-4">¿Cómo te sientes?</h2>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3 mb-4">
        {MOOD_OPTIONS.map(m => (
          <button
            key={m.key}
            onClick={() => setSelected(m.key)}
            disabled={confirmed}
            className={cn(
              'aspect-square rounded-md border-2 flex flex-col items-center justify-center gap-1 transition-colors',
              selected === m.key
                ? 'border-accent bg-accent-soft'
                : 'border-line bg-bg hover:border-line-2'
            )}
          >
            <span className="text-3xl leading-none">{m.emoji}</span>
            <span className="text-[10px] font-medium text-muted">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Extras · 2 columnas (PRD §12) */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <ExtraToggle
          label={showEstres ? '💼 Estrés laboral' : '+ Estrés'}
          active={showEstres}
          onClick={() => setShowEstres(s => !s)}
        />
        <ExtraToggle
          label={showEnergia ? '🔥 Energía sexual' : '+ Energía'}
          active={showEnergia}
          onClick={() => setShowEnergia(s => !s)}
        />
      </div>

      {showEstres && (
        <div className="mb-4 animate-in-up">
          <div className="eyebrow mb-2">Estrés / presión laboral</div>
          <EnumPicker options={PRESION_OPTS} value={estres} onChange={setEstres} />
        </div>
      )}

      {showEnergia && (
        <div className="mb-4 animate-in-up">
          <div className="eyebrow mb-2">Energía sexual · 1 a 10</div>
          <Scale10 value={energia} onChange={setEnergia} />
        </div>
      )}

      <Textarea
        placeholder="Una nota corta… (opcional)"
        value={nota}
        onChange={e => setNota(e.target.value)}
        rows={2}
        className="mb-4"
        disabled={confirmed}
      />

      <Button
        variant="accent"
        className="w-full py-3.5"
        disabled={!selected || pending || confirmed}
        onClick={submit}
      >
        {confirmed ? 'Guardado ✓' : pending ? 'Guardando…' : 'Registrar mood'}
      </Button>
    </div>
  );
}

function ExtraToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md border-2 px-3 py-3 text-[13px] font-medium transition-colors text-left',
        active ? 'border-accent bg-bg' : 'border-line bg-bg hover:border-line-2'
      )}
    >
      {label}
    </button>
  );
}

/**
 * Empaqueta extras en la nota como prefijo etiquetado · simple, sin schema change.
 * Ejemplo: "[estres: alta] [energia: 7] · su nota aquí"
 */
function buildNota(nota: string, estres: PresionTrabajo | null, energia: number | null): string | null {
  const parts: string[] = [];
  if (estres) parts.push(`[estres: ${estres}]`);
  if (energia !== null) parts.push(`[energia: ${energia}]`);
  if (nota.trim()) parts.push(nota.trim());
  return parts.length === 0 ? null : parts.join(' · ');
}
