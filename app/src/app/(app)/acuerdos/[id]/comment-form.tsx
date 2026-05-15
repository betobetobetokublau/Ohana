'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Textarea } from '@/components/ui';

export function CommentForm({ acuerdoId, userId }: { acuerdoId: string; userId: string }) {
  const router = useRouter();
  const [contenido, setContenido] = useState('');
  const [pending, startTransition] = useTransition();

  async function submit() {
    if (!contenido.trim()) return;
    const supabase = createClient();
    await supabase.from('acuerdo_comentarios').insert({
      acuerdo_id: acuerdoId,
      user_id: userId,
      contenido: contenido.trim(),
    });
    setContenido('');
    startTransition(() => router.refresh());
  }

  return (
    <div className="mt-4">
      <Textarea
        placeholder="Escribe un comentario…"
        rows={2}
        value={contenido}
        onChange={e => setContenido(e.target.value)}
      />
      <div className="flex justify-end mt-2">
        <Button variant="accent" size="sm" onClick={submit} disabled={pending || !contenido.trim()}>
          {pending ? 'Enviando…' : 'Comentar'}
        </Button>
      </div>
    </div>
  );
}
