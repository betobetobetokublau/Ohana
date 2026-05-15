'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Textarea } from '@/components/ui';

export function SeguimientoForm({ proyectoId, userId }: { proyectoId: string; userId: string }) {
  const router = useRouter();
  const [contenido, setContenido] = useState('');
  const [pending, startTransition] = useTransition();

  async function submit() {
    if (!contenido.trim()) return;
    const supabase = createClient();
    await supabase.from('proyecto_seguimientos').insert({
      proyecto_id: proyectoId,
      autor_id: userId,
      fecha: new Date().toISOString().slice(0, 10),
      contenido: contenido.trim(),
    });
    setContenido('');
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <Textarea
        placeholder="Decidimos paleta cálida: terracotta + cream + madera clara…"
        rows={3}
        value={contenido}
        onChange={e => setContenido(e.target.value)}
      />
      <div className="flex justify-end mt-2">
        <Button variant="accent" size="sm" onClick={submit} disabled={pending || !contenido.trim()}>
          {pending ? 'Guardando…' : 'Agregar seguimiento'}
        </Button>
      </div>
    </div>
  );
}
