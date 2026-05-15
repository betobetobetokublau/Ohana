'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Pill } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import type { ClaudeVerdict } from '@/lib/types';

const VERDICT_LABEL: Record<ClaudeVerdict, string> = {
  no_concern: 'Sin conflicto',
  talk_first: 'Hablar primero',
  violation: 'Cruza un acuerdo',
  ambiguous: 'Ambiguo',
};

const VERDICT_VARIANT: Record<ClaudeVerdict, 'success' | 'warning' | 'error' | 'default'> = {
  no_concern: 'success',
  talk_first: 'warning',
  violation: 'error',
  ambiguous: 'default',
};

type Message =
  | { role: 'user'; text: string }
  | { role: 'ai'; verdict: ClaudeVerdict; summary: string };

export function ClaudeChat({
  coupleId,
  userId,
  acuerdosCount,
}: {
  coupleId: string;
  userId: string;
  acuerdosCount: number;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const escenario = input.trim();
    setMessages(m => [...m, { role: 'user', text: escenario }]);
    setInput('');
    setLoading(true);

    // Persistimos la consulta (sin response aún · response viene en Phase 4)
    const supabase = createClient();
    await supabase.from('claude_consultas').insert({
      couple_id: coupleId,
      user_id: userId,
      escenario,
      verdict: 'ambiguous', // placeholder
      respuesta: { stub: true },
    });

    // Phase 4 · aquí llamaríamos a /api/claude/check con el escenario y los acuerdos.
    // Por ahora respondemos con un placeholder que explica el estado del feature.
    setTimeout(() => {
      setMessages(m => [...m, {
        role: 'ai',
        verdict: 'ambiguous',
        summary: 'Esta consulta requiere integración con Claude API (Phase 4). Mientras tanto, tu pregunta queda registrada y la analizamos manualmente. Cuando el cron de Claude esté activo, cada consulta regresará verdict estructurado (no_concern · talk_first · violation · ambiguous) con los acuerdos relevantes que detectó.',
      }]);
      setLoading(false);
    }, 600);
  }

  return (
    <div>
      <div className="space-y-3 mb-4 min-h-[200px]">
        {messages.length === 0 && (
          <div className="card-warm">
            <p className="text-[13px] text-accent-deep">
              Tienen <strong>{acuerdosCount}</strong> acuerdo{acuerdosCount === 1 ? '' : 's'} registrado{acuerdosCount === 1 ? '' : 's'}.
              Claude los lee y verifica el escenario contra todos. Ejemplo de pregunta:
              <em className="block mt-2 font-serif">
                "Si me voy de fin de semana con mis primos sin avisar antes, ¿rompe algún acuerdo?"
              </em>
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'p-3 rounded-md max-w-[85%]',
              msg.role === 'user'
                ? 'bg-ink text-bg ml-auto rounded-br-sm'
                : 'bg-white border border-accent-soft rounded-bl-sm'
            )}
          >
            {msg.role === 'user' ? (
              <p className="text-[14px]">{msg.text}</p>
            ) : (
              <>
                <Pill variant={VERDICT_VARIANT[msg.verdict]} className="mb-2">
                  {VERDICT_LABEL[msg.verdict]}
                </Pill>
                <p className="text-[14px] leading-relaxed">{msg.summary}</p>
              </>
            )}
          </div>
        ))}

        {loading && (
          <div className="bg-white border border-accent-soft rounded-md p-3 max-w-[85%]">
            <p className="meta italic">Analizando contra acuerdos…</p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Pregunta un escenario…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          disabled={loading}
        />
        <Button variant="accent" onClick={send} disabled={loading || !input.trim()}>
          Enviar
        </Button>
      </div>
      <p className="meta mt-3">
        Las preguntas son privadas. Tu pareja no las ve a menos que tú las compartas.
      </p>
    </div>
  );
}
