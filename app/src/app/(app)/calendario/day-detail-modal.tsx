'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createClient } from '@/lib/supabase/client';
import { Pill } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { X } from 'lucide-react';
import { canMarkAsDone, getDetailHref } from '@/lib/utils/event-actions';
import { VariableAmountInput } from '@/components/shared/variable-amount-input';
import type { CalendarEvent } from './types';

/**
 * Modal centrado con fondo dimmed · lista actividades del día seleccionado.
 * - Título: nombre del día
 * - Cada actividad: categoría + persona asignada + checkbox mark-as-done
 * - Click fuera o ESC cierra
 */
export function DayDetailModal({
  date,
  events,
  onClose,
}: {
  date: Date;
  events: CalendarEvent[];
  onClose: () => void;
}) {
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const title = format(date, "EEEE d 'de' MMMM", { locale: es });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-in-fade"
      onClick={onClose}
    >
      <div
        className="bg-bg border border-line rounded-lg shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto animate-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-line">
          <div>
            <div className="eyebrow text-accent">Día seleccionado</div>
            <h2 className="font-serif text-2xl capitalize mt-1">{title}</h2>
            <p className="meta mt-1">{events.length} actividad{events.length === 1 ? '' : 'es'}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm p-1.5 hover:bg-surface transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {events.length === 0 ? (
            <p className="italic-serif text-[14px] text-center py-8">
              Nada agendado este día.
            </p>
          ) : (
            <div className="space-y-2">
              {events.map(ev => (
                <DayEventRow key={ev.id} event={ev} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DayEventRow({ event }: { event: CalendarEvent }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showAmountInput, setShowAmountInput] = useState(false);

  const canToggle = canMarkAsDone(event.type);
  const detailHref = getDetailHref(event);

  async function toggle() {
    if (event.variableUnfilled) {
      setShowAmountInput(true);
      return;
    }

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
    <div
      className={cn(
        'border border-line rounded-md p-3 transition-colors',
        event.completed ? 'bg-surface opacity-70' : 'bg-bg',
        pending && 'opacity-50'
      )}
    >
      <div className="flex items-start gap-3">
        {canToggle ? (
          <button
            onClick={toggle}
            className={cn(
              'flex-shrink-0 w-5 h-5 rounded-sm border-2 transition-colors flex items-center justify-center mt-0.5',
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
            className="inline-block w-2 h-2 rounded-full mt-2"
            style={{ backgroundColor: event.color }}
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            {detailHref ? (
              <Link href={detailHref} className="hover:underline">
                <span className={cn('font-medium text-[14px]', event.completed && 'line-through')}>
                  {event.label}
                </span>
              </Link>
            ) : (
              <span className={cn('font-medium text-[14px]', event.completed && 'line-through')}>
                {event.label}
              </span>
            )}
            {event.category && (
              <Pill style={{ backgroundColor: `${event.color}30`, color: event.color }}>
                {event.category}
              </Pill>
            )}
          </div>
          {(event.monto !== undefined || event.variableUnfilled) && (
            <div className="meta mt-1">
              {event.variableUnfilled
                ? 'Monto por capturar'
                : `$${event.monto?.toLocaleString()}`}
            </div>
          )}
        </div>
      </div>

      {showAmountInput && (
        <VariableAmountInput
          variant="card"
          onConfirm={confirmVariableAmount}
          onCancel={() => setShowAmountInput(false)}
        />
      )}
    </div>
  );
}
