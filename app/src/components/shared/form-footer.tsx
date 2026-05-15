'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

/**
 * Footer estándar para forms · Cancel (router.back) + Submit.
 * Replaces ~80 líneas duplicadas across 18 form files.
 *
 * Uso:
 *   <FormFooter
 *     loading={loading}
 *     submitDisabled={!nombre || !categoria}
 *     submitLabel="Crear acuerdo"
 *     loadingLabel="Guardando…"
 *   />
 */
interface FormFooterProps {
  loading: boolean;
  submitDisabled?: boolean;
  submitLabel: string;
  loadingLabel?: string;
  cancelLabel?: string;
}

export function FormFooter({
  loading,
  submitDisabled = false,
  submitLabel,
  loadingLabel = 'Guardando…',
  cancelLabel = 'Cancelar',
}: FormFooterProps) {
  const router = useRouter();
  return (
    <div className="flex gap-3 pt-2">
      <Button variant="ghost" type="button" onClick={() => router.back()}>
        {cancelLabel}
      </Button>
      <Button
        variant="accent"
        type="submit"
        className="flex-1"
        disabled={loading || submitDisabled}
      >
        {loading ? loadingLabel : submitLabel}
      </Button>
    </div>
  );
}

/**
 * Error display estándar · banner inline para errors de formulario.
 */
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="text-[13px] text-error font-medium">{message}</p>;
}
