'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input, Field, Checkbox } from '@/components/ui';
import { FormFooter, FormError } from '@/components/shared/form-footer';
import { cn } from '@/lib/utils/cn';

export function NewRevisionForm({
  coupleId,
  users,
}: {
  coupleId: string;
  users: { id: string; display_name: string | null }[];
}) {
  const router = useRouter();
  const [tipo, setTipo] = useState('');
  const [fecha, setFecha] = useState('');
  const [asignados, setAsignados] = useState<string[]>(users.map(u => u.id));
  const [agrupados, setAgrupados] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleAsignado(id: string) {
    setAsignados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tipo || !fecha || asignados.length === 0) {
      setError('Falta tipo, fecha, o usuarios asignados.');
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from('saludsexual_revisiones').insert({
      couple_id: coupleId,
      proxima_fecha: fecha,
      tipo_revision: tipo,
      estudios_agrupados: agrupados,
      usuarios_asignados: asignados,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/salud-sexual');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Tipo de revisión">
        <Input
          required
          placeholder="Tamizaje ITS anual"
          value={tipo}
          onChange={e => setTipo(e.target.value)}
        />
      </Field>

      <Field label="Fecha programada">
        <Input
          type="date"
          required
          value={fecha}
          onChange={e => setFecha(e.target.value)}
        />
      </Field>

      <Field label="Asignados">
        <div className="space-y-2">
          {users.map(u => (
            <label
              key={u.id}
              className={cn(
                'flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors',
                asignados.includes(u.id)
                  ? 'border-ink bg-bg'
                  : 'border-line bg-surface'
              )}
            >
              <Checkbox
                checked={asignados.includes(u.id)}
                onCheckedChange={() => toggleAsignado(u.id)}
              />
              <span className="text-[14px]">{u.display_name ?? u.id}</span>
            </label>
          ))}
        </div>
      </Field>

      <label className="flex items-center gap-3 cursor-pointer">
        <Checkbox checked={agrupados} onCheckedChange={v => setAgrupados(v === true)} />
        <span className="text-[14px]">
          Estudios agrupados (varios análisis en una sola visita)
        </span>
      </label>

      <FormError message={error} />

      <FormFooter
        loading={loading}
        submitLabel="Programar revisión"
        loadingLabel="Programando…"
      />
    </form>
  );
}
