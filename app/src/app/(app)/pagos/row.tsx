'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { fmtRel } from '@/lib/utils/dates';
import { cn } from '@/lib/utils/cn';

type Pago = {
  id: string;
  nombre: string;
  monto: number;
  categoria: string | null;
  recurrencia: { value: number; unit: string } | null;
  due_date: string | null;
  pagado: boolean;
};

export function PagosListRow({ pago, isFirst }: { pago: Pago; isFirst: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function togglePagado() {
    const supabase = createClient();
    await supabase
      .from('pagos')
      .update({
        pagado: !pago.pagado,
        pagado_en: !pago.pagado ? new Date().toISOString() : null,
      })
      .eq('id', pago.id);
    startTransition(() => router.refresh());
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3',
        !isFirst && 'border-t border-line',
        pending && 'opacity-50'
      )}
    >
      <button
        onClick={togglePagado}
        className={cn(
          'flex-shrink-0 w-5 h-5 rounded-sm border-2 transition-colors flex items-center justify-center',
          pago.pagado
            ? 'bg-ink border-ink text-bg'
            : 'bg-bg border-line-2 hover:border-ink'
        )}
        aria-label={pago.pagado ? 'Marcar pendiente' : 'Marcar pagado'}
      >
        {pago.pagado && '✓'}
      </button>

      <div className="flex-1 min-w-0">
        <div className={cn('font-medium text-[14px]', pago.pagado && 'text-muted line-through')}>
          {pago.nombre}
        </div>
        <div className="meta">
          {pago.categoria}
          {pago.recurrencia && ` · cada ${pago.recurrencia.value} ${pago.recurrencia.unit}`}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="font-mono text-[15px] font-medium tabular-nums">
          ${Number(pago.monto).toLocaleString()}
        </div>
        {pago.due_date && (
          <div className={cn('meta', !pago.pagado && new Date(pago.due_date) < new Date() && 'text-error')}>
            {fmtRel(pago.due_date)}
          </div>
        )}
      </div>
    </div>
  );
}
