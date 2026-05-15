'use client';

import { useState } from 'react';
import { Input, Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

/**
 * Input inline para capturar monto variable de un pago antes de marcarlo como hecho.
 * - Aparece debajo del checkbox cuando un pago `monto_variable` se está marcando.
 * - El parent decide el flujo de guardar (puede crear pago_instancias + actualizar pago).
 *
 * Usado en /pagos/row.tsx, /calendario/side-panel-row.tsx, /calendario/day-detail-modal.tsx.
 */
export function VariableAmountInput({
  onConfirm,
  onCancel,
  variant = 'card',
  autoFocus = true,
}: {
  onConfirm: (amount: number) => void | Promise<void>;
  onCancel: () => void;
  /** `card` para tarjeta centrada en modal/calendario, `inline` para pegar a una lista. */
  variant?: 'card' | 'inline';
  autoFocus?: boolean;
}) {
  const [amount, setAmount] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    if (!amount || submitting) return;
    setSubmitting(true);
    try {
      await onConfirm(Number(amount));
    } finally {
      // Si el parent triggerea router.refresh() el componente se desmonta,
      // pero por si acaso no, resetear.
      setSubmitting(false);
      setAmount('');
    }
  }

  return (
    <div
      className={cn(
        'animate-in-up',
        variant === 'card'
          ? 'mt-3 p-3 bg-accent-soft/50 rounded-md'
          : 'px-4 py-3 bg-accent-soft/50 border-t border-accent-soft'
      )}
    >
      <div className="eyebrow text-accent-deep mb-2">¿Cuánto fue este mes?</div>
      <div className="flex gap-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder="2400"
          value={amount}
          onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
          autoFocus={autoFocus}
        />
        <Button
          variant="accent"
          size="sm"
          onClick={handleConfirm}
          disabled={!amount || submitting}
        >
          {submitting ? 'Guardando…' : 'Guardar'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
