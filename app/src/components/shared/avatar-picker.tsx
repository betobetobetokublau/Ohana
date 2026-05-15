'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AVATAR_EMOJIS, AVATAR_COLORS, DEFAULT_AVATAR_EMOJI, DEFAULT_AVATAR_COLOR } from '@/lib/utils/avatar';
import { Avatar } from './avatar';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface AvatarPickerProps {
  userId: string;
  initialEmoji?: string | null;
  initialColor?: string | null;
}

export function AvatarPicker({ userId, initialEmoji, initialColor }: AvatarPickerProps) {
  const router = useRouter();
  const [emoji, setEmoji] = useState(initialEmoji ?? DEFAULT_AVATAR_EMOJI);
  const [color, setColor] = useState(initialColor ?? DEFAULT_AVATAR_COLOR);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const dirty = emoji !== (initialEmoji ?? DEFAULT_AVATAR_EMOJI) || color !== (initialColor ?? DEFAULT_AVATAR_COLOR);

  async function save() {
    const supabase = createClient();
    await supabase
      .from('users')
      .update({ avatar_emoji: emoji, avatar_color: color })
      .eq('id', userId);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    startTransition(() => router.refresh());
  }

  return (
    <div>
      {/* Preview */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar data={{ emoji, color }} size="xl" />
        <div>
          <div className="eyebrow">Tu avatar</div>
          <p className="italic-serif text-[14px] mt-1">
            Esto es lo que tu pareja y tú verán en cada parte del producto.
          </p>
        </div>
      </div>

      {/* Emoji grid */}
      <div className="mb-6">
        <div className="eyebrow mb-3">Emoji</div>
        <div className="grid grid-cols-8 gap-2">
          {AVATAR_EMOJIS.map(e => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={cn(
                'aspect-square rounded-md border-2 text-2xl flex items-center justify-center transition-colors leading-none',
                emoji === e
                  ? 'border-accent bg-accent-soft'
                  : 'border-line bg-bg hover:border-line-2'
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Color grid 5x5 */}
      <div className="mb-6">
        <div className="eyebrow mb-3">Color de fondo</div>
        <div className="grid grid-cols-5 gap-2 max-w-[280px]">
          {AVATAR_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={cn(
                'aspect-square rounded-md border-2 transition-colors',
                color === c
                  ? 'border-ink ring-2 ring-ink ring-offset-2 ring-offset-bg'
                  : 'border-line-2 hover:border-ink'
              )}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex gap-3">
        <Button
          variant="accent"
          disabled={!dirty || pending}
          onClick={save}
        >
          {pending ? 'Guardando…' : saved ? 'Guardado ✓' : 'Guardar avatar'}
        </Button>
        {dirty && (
          <Button
            variant="ghost"
            onClick={() => {
              setEmoji(initialEmoji ?? DEFAULT_AVATAR_EMOJI);
              setColor(initialColor ?? DEFAULT_AVATAR_COLOR);
            }}
          >
            Cancelar cambios
          </Button>
        )}
      </div>
    </div>
  );
}
