'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui';
import type { TemaEstado } from '@/lib/types';

export function TemaActions({
  temaId,
  coupleId,
  currentEstado,
  hasAcuerdo,
  temaNombre,
}: {
  temaId: string;
  coupleId: string;
  currentEstado: TemaEstado;
  hasAcuerdo: boolean;
  temaNombre: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showResolver, setShowResolver] = useState(false);
  const [acuerdoNombre, setAcuerdoNombre] = useState(`Acuerdo resuelto desde: ${temaNombre}`);

  async function changeEstado(newEstado: TemaEstado) {
    setLoading(true);
    const supabase = createClient();
    await supabase.from('temas').update({ estado: newEstado }).eq('id', temaId);
    setLoading(false);
    router.refresh();
  }

  async function resolverEnAcuerdo() {
    setLoading(true);
    const supabase = createClient();

    // Crear acuerdo nuevo
    const { data: acuerdo, error: e1 } = await supabase
      .from('acuerdos')
      .insert({
        couple_id: coupleId,
        nombre: acuerdoNombre,
        categoria: 'otros',
      })
      .select('id')
      .single();

    if (e1 || !acuerdo) {
      alert('Error al crear acuerdo: ' + e1?.message);
      setLoading(false);
      return;
    }

    // Marcar tema como resuelto vinculado al acuerdo
    await supabase
      .from('temas')
      .update({ estado: 'resuelto', acuerdo_resuelto_id: acuerdo.id })
      .eq('id', temaId);

    setLoading(false);
    router.refresh();
  }

  if (currentEstado === 'archivado') {
    return (
      <Button variant="ghost" size="sm" onClick={() => changeEstado('abierto')} disabled={loading}>
        Desarchivar
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {currentEstado === 'abierto' && (
          <Button variant="ghost" size="sm" onClick={() => changeEstado('en_discusion')} disabled={loading}>
            → Marcar en discusión
          </Button>
        )}
        {currentEstado === 'en_discusion' && (
          <Button variant="ghost" size="sm" onClick={() => changeEstado('abierto')} disabled={loading}>
            ← Volver a abierto
          </Button>
        )}
        {currentEstado !== 'resuelto' && !hasAcuerdo && (
          <Button
            variant="accent"
            size="sm"
            onClick={() => setShowResolver(!showResolver)}
            disabled={loading}
          >
            ✓ Resolver en acuerdo
          </Button>
        )}
        {currentEstado === 'resuelto' && (
          <Button variant="ghost" size="sm" onClick={() => changeEstado('archivado')} disabled={loading}>
            Archivar
          </Button>
        )}
      </div>

      {showResolver && (
        <div className="card-warm">
          <div className="eyebrow text-accent-deep mb-2">Crear acuerdo desde tema</div>
          <input
            value={acuerdoNombre}
            onChange={e => setAcuerdoNombre(e.target.value)}
            className="w-full rounded-md border border-line bg-bg px-3 py-2 text-[14px] mb-3"
          />
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowResolver(false)}>
              Cancelar
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={resolverEnAcuerdo}
              disabled={loading || !acuerdoNombre.trim()}
              className="flex-1"
            >
              Crear acuerdo y resolver
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
