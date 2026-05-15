'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input } from '@/components/ui';
import type { TemaEstado, AcuerdoCategoria } from '@/lib/types';
import { ACUERDO_CATEGORIA_LABEL } from '@/lib/utils/modules';

export function TemaActions({
  temaId,
  coupleId,
  currentEstado,
  temaNombre,
  availableAcuerdos,
}: {
  temaId: string;
  coupleId: string;
  currentEstado: TemaEstado;
  temaNombre: string;
  availableAcuerdos: { id: string; nombre: string; categoria: AcuerdoCategoria | null }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showLinkOptions, setShowLinkOptions] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [acuerdoNombre, setAcuerdoNombre] = useState(`Acuerdo desde: ${temaNombre}`);

  async function changeEstado(newEstado: TemaEstado) {
    setLoading(true);
    const supabase = createClient();
    await supabase.from('temas').update({ estado: newEstado }).eq('id', temaId);
    setLoading(false);
    router.refresh();
  }

  async function linkExistingAcuerdo(acuerdoId: string) {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('tema_acuerdo_links').insert({
      tema_id: temaId,
      acuerdo_id: acuerdoId,
      vinculado_por: user?.id,
    });
    setLoading(false);
    setShowLinkOptions(false);
    router.refresh();
  }

  async function createAndLinkAcuerdo() {
    setLoading(true);
    const supabase = createClient();
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

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('tema_acuerdo_links').insert({
      tema_id: temaId,
      acuerdo_id: acuerdo.id,
      vinculado_por: user?.id,
    });

    setLoading(false);
    setShowCreateForm(false);
    setShowLinkOptions(false);
    router.refresh();
  }

  async function markAsResolved() {
    await changeEstado('resuelto');
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {currentEstado === 'archivado' && (
          <Button variant="ghost" size="sm" onClick={() => changeEstado('abierto')} disabled={loading}>
            Desarchivar
          </Button>
        )}
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
        {currentEstado !== 'resuelto' && currentEstado !== 'archivado' && (
          <Button variant="accent" size="sm" onClick={markAsResolved} disabled={loading}>
            ✓ Marcar como resuelto
          </Button>
        )}
        {currentEstado === 'resuelto' && (
          <Button variant="ghost" size="sm" onClick={() => changeEstado('archivado')} disabled={loading}>
            Archivar
          </Button>
        )}
        {!showLinkOptions && (
          <Button variant="ghost" size="sm" onClick={() => setShowLinkOptions(true)}>
            + Acuerdo
          </Button>
        )}
      </div>

      {showLinkOptions && (
        <div className="card-warm space-y-3 animate-in-up">
          <div className="eyebrow text-accent-deep">Vincular o crear acuerdo</div>

          {!showCreateForm && availableAcuerdos.length > 0 && (
            <div>
              <p className="text-[13px] mb-2">Vincular acuerdo existente:</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {availableAcuerdos.map(a => (
                  <button
                    key={a.id}
                    onClick={() => linkExistingAcuerdo(a.id)}
                    className="w-full text-left p-2 bg-bg border border-line rounded-sm hover:border-ink text-[13px]"
                  >
                    <div className="font-medium">{a.nombre}</div>
                    {a.categoria && (
                      <div className="meta">{ACUERDO_CATEGORIA_LABEL[a.categoria]}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!showCreateForm && (
            <div className="flex gap-2 items-center pt-2 border-t border-line">
              <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(true)}>
                O crear acuerdo nuevo
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowLinkOptions(false)}>
                Cancelar
              </Button>
            </div>
          )}

          {showCreateForm && (
            <div>
              <p className="text-[13px] mb-2">Nuevo acuerdo:</p>
              <Input
                value={acuerdoNombre}
                onChange={e => setAcuerdoNombre(e.target.value)}
                className="mb-2"
              />
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                  ← Volver
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={createAndLinkAcuerdo}
                  disabled={loading || !acuerdoNombre.trim()}
                  className="flex-1"
                >
                  Crear y vincular
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
