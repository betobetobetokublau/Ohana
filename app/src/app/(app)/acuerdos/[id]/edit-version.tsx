'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Textarea, EnumPicker, Field } from '@/components/ui';
import { ACUERDO_CATEGORIA_LABEL } from '@/lib/utils/modules';
import type { AcuerdoCategoria } from '@/lib/types';

const CATEGORIAS: readonly AcuerdoCategoria[] = [
  'comunicacion', 'dinero', 'familia', 'tiempo', 'intimidad', 'hogar', 'otros',
];

/**
 * Botón + form que actualiza el acuerdo. El trigger `snapshot_acuerdo` en DB
 * automáticamente crea una nueva versión cuando cambia nombre/descripción/categoría.
 */
export function EditAsNewVersion({
  acuerdoId,
  currentNombre,
  currentDescripcion,
  currentCategoria,
}: {
  acuerdoId: string;
  currentNombre: string;
  currentDescripcion: string | null;
  currentCategoria: AcuerdoCategoria | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState(currentNombre);
  const [descripcion, setDescripcion] = useState(currentDescripcion ?? '');
  const [categoria, setCategoria] = useState<AcuerdoCategoria | null>(currentCategoria);
  const [pending, startTransition] = useTransition();

  const dirty =
    nombre !== currentNombre ||
    (descripcion || null) !== (currentDescripcion ?? null) ||
    categoria !== currentCategoria;

  async function save() {
    if (!dirty) return;
    const supabase = createClient();
    await supabase
      .from('acuerdos')
      .update({
        nombre,
        descripcion: descripcion.trim() || null,
        categoria,
      })
      .eq('id', acuerdoId);
    setOpen(false);
    startTransition(() => router.refresh());
  }

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        ✎ Editar como nueva versión
      </Button>
    );
  }

  return (
    <div className="card-warm space-y-4 animate-in-up">
      <div className="eyebrow text-accent-deep">Nueva versión del acuerdo</div>
      <p className="text-[13px]">
        Tus cambios quedan guardados como una nueva versión. El historial completo aparece
        en la conversación de abajo.
      </p>

      <Field label="Nombre">
        <Input value={nombre} onChange={e => setNombre(e.target.value)} />
      </Field>

      <Field label="Descripción">
        <Textarea
          rows={4}
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="Sin descripción"
        />
      </Field>

      <Field label="Categoría">
        <EnumPicker
          options={CATEGORIAS}
          value={categoria}
          onChange={setCategoria}
          labelMap={ACUERDO_CATEGORIA_LABEL}
        />
      </Field>

      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => {
          setOpen(false);
          setNombre(currentNombre);
          setDescripcion(currentDescripcion ?? '');
          setCategoria(currentCategoria);
        }}>
          Cancelar
        </Button>
        <Button
          variant="accent"
          className="flex-1"
          disabled={!dirty || pending || !nombre.trim()}
          onClick={save}
        >
          {pending ? 'Guardando…' : 'Guardar como nueva versión'}
        </Button>
      </div>
    </div>
  );
}
