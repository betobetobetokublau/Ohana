'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MOOD_OPTIONS } from '@/lib/utils/mood';
import { Button, Textarea } from '@/components/ui';
import type { MoodEmocion } from '@/types/database';
import { cn } from '@/lib/utils/cn';

export function MoodQuickCapture({
  coupleId,
  userId,
}: {
  coupleId: string;
  userId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<MoodEmocion | null>(null);
  const [nota, setNota] = useState('');
  const [pending, startTransition] = useTransition();

  async function submit() {
    if (!selected) return;
    const supabase = createClient();
    await supabase.from('mood_checkins').insert({
      couple_id: coupleId,
      user_id: userId,
      emocion: selected,
      nota: nota.trim() || null,
    });
    setOpen(false);
    setSelected(null);
    setNota('');
    startTransition(() => router.refresh());
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 w-full bg-accent text-white rounded-md py-3 text-[13px] font-semibold uppercase tracking-wider hover:bg-accent-deep transition-colors"
      >
        Cómo te sientes ahora
      </button>
    );
  }

  return (
    <div className="mt-4 bg-surface border border-line rounded-md p-4 animate-in-up">
      <div className="eyebrow mb-3">Tu mood en este momento</div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {MOOD_OPTIONS.map(m => (
          <button
            key={m.key}
            onClick={() => setSelected(m.key)}
            className={cn(
              'aspect-square rounded-md border-2 flex flex-col items-center justify-center gap-1 transition-colors',
              selected === m.key
                ? 'border-accent bg-accent-soft'
                : 'border-line bg-bg hover:border-line-2'
            )}
          >
            <span className="text-2xl leading-none">{m.emoji}</span>
            <span className="text-[10px] font-medium text-muted">{m.label}</span>
          </button>
        ))}
      </div>

      <Textarea
        placeholder="Una nota corta… (opcional)"
        value={nota}
        onChange={e => setNota(e.target.value)}
        rows={2}
        className="mb-3"
      />

      <div className="flex gap-2">
        <Button
          variant="accent"
          className="flex-1"
          disabled={!selected || pending}
          onClick={submit}
        >
          {pending ? 'Enviando…' : 'Enviar'}
        </Button>
        <Button variant="ghost" onClick={() => { setOpen(false); setSelected(null); setNota(''); }}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
