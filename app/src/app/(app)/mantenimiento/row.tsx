'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { fmtRel } from '@/lib/utils/dates';
import { cn } from '@/lib/utils/cn';

type Accionable = {
  id: string;
  titulo: string;
  descripcion: string | null;
  due_date: string | null;
  completado_at: string | null;
  recurrencia: { value: number; unit: string } | null;
};

export function MantRow({ item }: { item: Accionable }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function toggleComplete() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('accionables')
      .update({
        completado_at: item.completado_at ? null : new Date().toISOString(),
        completado_por: item.completado_at ? null : user.id,
      })
      .eq('id', item.id);

    startTransition(() => router.refresh());
  }

  const vencida = !item.completado_at && item.due_date && new Date(item.due_date) < new Date();

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 border-b border-line last:border-b-0',
        pending && 'opacity-50'
      )}
    >
      <button
        onClick={toggleComplete}
        className={cn(
          'flex-shrink-0 w-5 h-5 rounded-sm border-2 transition-colors flex items-center justify-center',
          item.completado_at
            ? 'bg-ink border-ink text-bg'
            : 'bg-bg border-line-2 hover:border-ink'
        )}
      >
        {item.completado_at && '✓'}
      </button>

      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'font-medium text-[14px]',
            item.completado_at && 'text-muted line-through'
          )}
        >
          {item.titulo}
        </div>
        {item.recurrencia && (
          <div className="meta">
            cada {item.recurrencia.value} {item.recurrencia.unit}
          </div>
        )}
      </div>

      {item.due_date && (
        <div
          className={cn(
            'meta text-right whitespace-nowrap',
            vencida && 'text-error font-semibold'
          )}
        >
          {fmtRel(item.due_date)}
        </div>
      )}
    </div>
  );
}
