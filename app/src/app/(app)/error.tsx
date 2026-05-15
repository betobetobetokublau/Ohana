'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error boundary caught:', error);
  }, [error]);

  return (
    <div className="px-5 py-12 md:px-10 max-w-xl mx-auto">
      <div className="eyebrow text-error mb-2">Algo se rompió</div>
      <h1 className="display text-3xl">
        Un error inesperado en <em>esta pantalla</em>.
      </h1>
      <p className="italic-serif text-[15px] mt-3 mb-6">
        No tocó tu data — solo no pudimos mostrar este módulo. Intenta de nuevo o vuelve a Hoy.
      </p>

      {error.digest && (
        <div className="card-warm mb-6 font-mono text-[11px] tracking-tight">
          <div className="eyebrow text-accent-deep mb-1">Código de error</div>
          {error.digest}
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="accent" onClick={reset}>
          Intentar de nuevo
        </Button>
        <Button variant="ghost" onClick={() => (window.location.href = '/hoy')}>
          Volver a Hoy
        </Button>
      </div>
    </div>
  );
}
