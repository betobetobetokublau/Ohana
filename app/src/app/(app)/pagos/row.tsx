'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { fmtRel } from '@/lib/utils/dates';
import { cn } from '@/lib/utils/cn';
import { VariableAmountInput } from '@/components/shared/variable-amount-input';

type Pago = {
  id: string;
  nombre: string;
  monto: number;
  monto_variable: boolean;
  categoria: string | null;
  recurrencia: { value: number; unit: string } | null;
  due_date: string | null;
  pagado: boolean;
};

export function PagosListRow({ pago, isFirst }: { pago: Pago; isFirst: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showAmountInput, setShowAmountInput] = useState(false);

  async function togglePagado() {
    // Si es variable y aún no está pagado, pedir el monto primero
    if (pago.monto_variable && !pago.pagado) {
      setShowAmountInput(true);
      return;
    }

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

  async function confirmVariableAmount(amount: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Registrar la instancia del pago de este mes
    await supabase.from('pago_instancias').insert({
      pago_id: pago.id,
      monto: amount,
      due_date: pago.due_date,
      pagado_por: user.id,
    });

    // Marcar el pago padre como pagado (trigger regenera próxima ocurrencia)
    await supabase
      .from('pagos')
      .update({
        pagado: true,
        pagado_en: new Date().toISOString(),
        monto: amount, // último monto registrado, referencia
      })
      .eq('id', pago.id);

    setShowAmountInput(false);
    startTransition(() => router.refresh());
  }

  return (
    <>
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
            {pago.monto_variable && (
              <span className="meta ml-2 normal-case tracking-normal">monto variable</span>
            )}
          </div>
          <div className="meta">
            {pago.categoria}
            {pago.recurrencia && ` · cada ${pago.recurrencia.value} ${pago.recurrencia.unit}`}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          {pago.monto_variable && !pago.pagado ? (
            <div className="meta italic">por capturar</div>
          ) : (
            <div className="font-mono text-[15px] font-medium tabular-nums">
              ${Number(pago.monto).toLocaleString()}
            </div>
          )}
          {pago.due_date && (
            <div className={cn('meta', !pago.pagado && new Date(pago.due_date) < new Date() && 'text-error')}>
              {fmtRel(pago.due_date)}
            </div>
          )}
        </div>
      </div>

      {/* Amount input inline · variable cost */}
      {showAmountInput && (
        <VariableAmountInput
          variant="inline"
          onConfirm={confirmVariableAmount}
          onCancel={() => setShowAmountInput(false)}
        />
      )}
    </>
  );
}
