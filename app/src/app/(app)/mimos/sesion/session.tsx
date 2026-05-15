'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Pill } from '@/components/ui';
import { orderAlternating } from '@/lib/utils/mimos';
import type { MimoEmocion } from '@/lib/types';

const EMOCION_LABEL: Record<MimoEmocion, string> = {
  gratitud: 'Gratitud',
  ternura: 'Ternura',
  admiracion: 'Admiración',
  orgullo: 'Orgullo',
  diversion: 'Diversión',
  deseo: 'Deseo',
  paz: 'Paz',
};

type Mimo = {
  id: string;
  autor_id: string;
  titulo: string;
  descripcion: string | null;
  emocion_asociada: MimoEmocion | null;
  created_at: string;
};

export function MimosSession({
  coupleId,
  mimos,
  myId,
  partnerId,
}: {
  coupleId: string;
  mimos: Mimo[];
  myId: string;
  partnerId: string;
}) {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [finishing, setFinishing] = useState(false);

  // Ordenamos alternando autores cuando es posible (UI ritual)
  const ordered = orderAlternating(mimos, myId, partnerId);
  const total = ordered.length;
  const current = ordered[currentIdx];

  async function finishSession() {
    setFinishing(true);
    const supabase = createClient();

    // Crear sesión
    const { data: session } = await supabase
      .from('mimos_sessions')
      .insert({
        couple_id: coupleId,
        fecha_programada: new Date().toISOString().slice(0, 10),
        realizada_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (session) {
      // Marcar todos los mimos como revelados
      await supabase
        .from('mimos')
        .update({ revealed_in_session_id: session.id })
        .in('id', ordered.map(m => m.id));
    }

    router.push('/mimos');
    router.refresh();
  }

  if (!revealed) {
    return (
      <div className="card-warm text-center py-12">
        <div className="font-serif italic text-2xl mb-3">
          {total} mimo{total === 1 ? '' : 's'} listos para revelar
        </div>
        <p className="italic-serif text-[15px] mb-8 max-w-md mx-auto">
          Cuando den click, los mimos se revelan uno por uno, alternando entre los dos. Tómense su tiempo.
        </p>
        <Button variant="accent" onClick={() => setRevealed(true)}>
          Comenzar el ritual
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-baseline mb-6">
        <div className="eyebrow text-accent">
          Mimo {currentIdx + 1} de {total}
        </div>
        <div className="meta">
          {ordered.filter(m => m.autor_id === myId).length} tuyos · {ordered.filter(m => m.autor_id === partnerId).length} de tu pareja
        </div>
      </div>

      <div className="min-h-[400px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, rotateY: -90, scale: 0.95 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: 90, scale: 0.95 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-full max-w-2xl"
              style={{ perspective: 1000 }}
            >
              <div className="bg-bg border-2 border-accent rounded-lg p-8 md:p-12 text-center">
                <div className="eyebrow text-accent mb-3">
                  {current.autor_id === myId ? 'de ti' : 'de tu pareja'}
                  {current.emocion_asociada && (
                    <> · {EMOCION_LABEL[current.emocion_asociada]}</>
                  )}
                </div>
                <h2 className="font-serif italic text-3xl md:text-4xl leading-tight mb-6">
                  {current.titulo}
                </h2>
                {current.descripcion && (
                  <p className="font-serif text-lg leading-relaxed max-w-lg mx-auto">
                    {current.descripcion}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center mt-8">
        <Button
          variant="ghost"
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
        >
          ← Anterior
        </Button>
        {currentIdx < total - 1 ? (
          <Button variant="accent" onClick={() => setCurrentIdx(currentIdx + 1)}>
            Siguiente →
          </Button>
        ) : (
          <Button variant="accent" onClick={finishSession} disabled={finishing}>
            {finishing ? 'Finalizando…' : 'Cerrar sesión y archivar'}
          </Button>
        )}
      </div>
    </div>
  );
}

