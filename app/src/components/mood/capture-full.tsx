'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MOOD_OPTIONS } from '@/lib/utils/mood';
import { Button, Textarea } from '@/components/ui';
import type { MoodEmocion } from '@/types/database';
import { cn } from '@/lib/utils/cn';

export function MoodCaptureFull({ coupleId, userId }: { coupleId: string; userId: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<MoodEmocion | null>(null);
  const [nota, setNota] = useState('');
  const [pending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState(false);

  async function submit() {
    if (!selected) return;
    const supabase = createClient();
    await supabase.from('mood_checkins').insert({
      couple_id: coupleId,
      user_id: userId,
      emocion: selected,
      nota: nota.trim() || null,
    });
    setConfirmed(true);
    setTimeout(() => {
      setSelected(null);
      setNota('');
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
