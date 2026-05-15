'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input, Textarea, Field } from '@/components/ui';
import { FormFooter, FormError } from '@/components/shared/form-footer';

export function NewDiscusionForm({
  coupleId,
  userId,
  temas,
}: {
  coupleId: string;
  userId: string;
  temas: { id: string; nombre_tema: string }[];
}) {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [resumen, setResumen] = useState('');
  const [contexto, setContexto] = useState('');
  const [aprendimos, setAprendimos] = useState('');
  const [temaId, setTemaId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre) {
      setError('Pon al menos un nombre.');
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from('discusiones').insert({
      couple_id: coupleId,
      creado_por: userId,
      nombre_evento: nombre,
      fecha: fecha || null,
      resumen: resumen.trim() || null,
      contexto_causante: contexto.trim() || null,
      que_aprendimos: aprendimos.trim() || null,
      tema_relacionado_id: temaId || null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/discusiones');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Nombre del evento">
        <Input
          required
          placeholder="Discusión sobre tiempos con familias"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
        />
      </Field>

      <Field label="Fecha">
        <Input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
        />
      </Field>

      <Field label="Resumen" hint="Qué pasó, en breve. Sin asignar culpa.">
        <Textarea
          rows={3}
          placeholder="Discutimos durante 40 minutos sobre…"
          value={resumen}
          onChange={e => setResumen(e.target.value)}
        />
      </Field>

      <Field label="Contexto causante" hint="Qué condiciones la destaparon. Cansancio, horario, antecedentes.">
        <Textarea
          rows={3}
          placeholder="El día había sido pesado en el trabajo para los dos…"
          value={contexto}
          onChange={e => setContexto(e.target.value)}
        />
      </Field>

      <Field label="Qué aprendimos" hint="Lecciones extraídas. Lo más importante del registro.">
        <Textarea
          rows={3}
          placeholder="1. Los temas familiares no se tocan miércoles 10pm cansados…"
          value={aprendimos}
          onChange={e => setAprendimos(e.target.value)}
        />
      </Field>

      {temas.length > 0 && (
        <Field label="Tema relacionado (opcional)">
          <select
            value={temaId}
            onChange={e => setTemaId(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3.5 py-3 text-[15px]"
          >
            <option value="">Sin tema relacionado</option>
            {temas.map(t => (
              <option key={t.id} value={t.id}>{t.nombre_tema}</option>
            ))}
          </select>
        </Field>
      )}

      <FormError message={error} />

      <FormFooter
        loading={loading}
        submitDisabled={!nombre}
        submitLabel="Registrar discusión"
      />
    </form>
  );
}
