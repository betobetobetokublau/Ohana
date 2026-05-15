'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { fmtRel } from '@/lib/utils/dates';
import { cn } from '@/lib/utils/cn';
import { canMarkAsDone, getDetailHref } from '@/lib/utils/event-actions';
import { VariableAmountInput } from '@/components/shared/variable-amount-input';
import type { CalendarEvent } from './types';

/**
 * Row del side panel · 14 días.
 * - Click en el título → deep-link al detalle del módulo
 * - Click en el checkbox → mark-as-done (con flujo especial para pago variable)
 * - Inline · si el pago es variable, muestra input para capturar monto antes de marcar
 */
export function SidePanelRow({ event }: { event: CalendarEvent }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showAmountInput, setShowAmountInput] = useState(false);

  const detailHref = getDetailHref(event);
  const canToggle = canMarkAsDone(event.type);

  async function toggle() {
    if (event.variableUnfilled) {
      setShowAmountInput(true);
      return;
    }
    await doToggle();
  }

  async function doToggle() {
    const supabase = createClient();
    if (event.type === 'pago') {
      await supabase
        .from('pagos')
        .update({
          pagado: !event.completed,
          pagado_en: !event.completed ? new Date().toISOString() : null,
        })
        .eq('id', event.sourceId);
    } else {
      // Accionable types
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from('accionables')
        .update({
          completado_at: event.completed ? null : new Date().toISOString(),
          completado_por: event.completed ? null : user.id,
        })
        .eq('id', event.sourceId);
    }
    startTransition(() => router.refresh());
  }

  async function confirmVariableAmount(amount: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('pago_instancias').insert({
      pago_id: event.sourceId,
      monto: amount,
      due_date: event.date,
      pagado_por: user.id,
    });

    await supabase
      .from('pagos')
      .update({
        pagado: true,
        pagado_en: new Date().toISOString(),
        monto: amount,
      })
      .eq('id', event.sourceId);

    setShowAmountInput(false);
    startTransition(() => router.refresh());
  }

  return (
    <div className={cn('grid grid-cols-[auto_1fr_auto] gap-2 py-2 items-baseline border-b border-line last:border-b-0', pending && 'opacity-50')}>
      {/* Checkbox · si tipo soporta mark-as-done */}
      {canToggle ? (
        <button
          onClick={toggle}
          className={cn(
            'mt-0.5 flex-shrink-0 w-4 h-4 rounded-sm border-2 transition-colors flex items-center justify-center text-[10px]',
            event.completed
              ? 'bg-ink border-ink text-bg'
              : 'bg-bg border-line-2 hover:border-ink'
          )}
          aria-label={event.completed ? 'Desmarcar' : 'Marcar como hecho'}
        >
          {event.completed && '✓'}
        </button>
      ) : (
        <span
          className="inline-block w-2 h-2 rounded-full mt-1.5"
          style={{ backgroundColor: event.color }}
        />
      )}

      <div className="min-w-0">
        {detailHref ? (
          <Link href={detailHref} className="hover:underline">
            <div className={cn('font-medium text-[13px] leading-tight', event.completed && 'line-through text-muted')}>
              {event.label}
            </div>
          </Link>
        ) : (
          <div className={cn('font-medium text-[13px] leading-tight', event.completed && 'line-through text-muted')}>
            {event.label}
          </div>
        )}
        <div className="font-mono text-[9px] text-muted uppercase tracking-wider mt-0.5">
          {event.type}
          {event.monto !== undefined && ` · $${event.monto.toLocaleString()}`}
          {event.variableUnfilled && ' · monto pendiente'}
        </div>
      </div>

      <div className="font-mono text-[11px] text-muted whitespace-nowrap">
        {fmtRel(event.date)}
      </div>

      {/* Variable amount input · transición show/off */}
      {showAmountInput && (
        <div className="col-span-3">
          <VariableAmountInput
            variant="card"
            onConfirm={confirmVariableAmount}
            onCancel={() => setShowAmountInput(false)}
          />
        </div>
      )}
    </div>
  );
}
