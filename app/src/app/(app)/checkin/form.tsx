'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Textarea, Label } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import type { EstadoAnimo, PresionTrabajo } from '@/types/database';

type Step = 1 | 2 | 'submitting';

const ANIMO_OPTS: { value: EstadoAnimo; label: string; emoji: string }[] = [
  { value: 'feliz',    label: 'Feliz',    emoji: '😄' },
  { value: 'neutral',  label: 'Neutral',  emoji: '🙂' },
  { value: 'agotado',  label: 'Agotado',  emoji: '😴' },
  { value: 'triste',   label: 'Triste',   emoji: '😔' },
];

const PRESION_OPTS: PresionTrabajo[] = ['baja', 'mediana', 'alta', 'extrema'];

export function CheckinForm({
  coupleId,
  userId,
  weekOf,
  hasPartner,
}: {
  coupleId: string;
  userId: string;
  weekOf: string;
  hasPartner: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Step 1 fields
  const [animo, setAnimo] = useState<EstadoAnimo | null>(null);
  const [energia, setEnergia] = useState<number | null>(null);
  const [deseo, setDeseo] = useState<number | null>(null);
  const [presion, setPresion] = useState<PresionTrabajo | null>(null);
  const [comentarios, setComentarios] = useState('');

  // Step 2 fields (partner rating)
  const [partnerEnergia, setPartnerEnergia] = useState<number | null>(null);
  const [partnerEstres, setPartnerEstres] = useState<PresionTrabajo | null>(null);

  const [error, setError] = useState<string | null>(null);

  function nextFromStep1() {
    if (!animo || !energia || !deseo || !presion) {
      setError('Llena energía, deseo, ánimo y presión laboral.');
      return;
    }
    setError(null);
    if (hasPartner) setStep(2);
    else submit();
  }

  function skipPartnerRating() {
    submit();
  }

  async function submit() {
    setStep('submitting');
    const supabase = createClient();
    const { error } = await supabase.from('checkins').insert({
      couple_id: coupleId,
      user_id: userId,
      week_of: weekOf,
      estado_animo: animo,
      energia,
      deseo,
      presion_trabajo: presion,
      comentarios: comentarios.trim() || null,
      partner_energia_percibida: partnerEnergia,
      partner_estres_percibido: partnerEstres,
    });

    if (error) {
      setError(error.message);
      setStep(2);
      return;
    }

    router.refresh();
  }

  if (step === 'submitting') {
    return (
      <div className="px-5 py-12 max-w-2xl mx-auto text-center">
        <p className="italic-serif text-lg">Enviando tu checkin…</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-8 md:px-10 max-w-2xl mx-auto">
      <div className="flex justify-between items-baseline mb-6">
        <div>
          <div className="eyebrow text-accent">
            Checkin · semana del {weekOf} · paso {step} de {hasPartner ? 2 : 1}
          </div>
          <h1 className="display text-3xl mt-1">
            {step === 1 ? <>¿Cómo va tu <em>semana</em>?</> : <>Así viste a tu <em>pareja</em>.</>}
          </h1>
          <p className="italic-serif text-[15px] mt-2">
            {step === 1
              ? 'Dos minutos. Antes de empezar la semana nueva.'
              : 'No es evaluación, es percepción. La diferencia con lo que ella sintió es información.'}
          </p>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-7">
          <Field label="Estado de ánimo">
            <div className="grid grid-cols-4 gap-2">
              {ANIMO_OPTS.map(o => (
                <button
                  key={o.value}
                  onClick={() => setAnimo(o.value)}
                  className={cn(
                    'aspect-square rounded-md border-2 flex flex-col items-center justify-center gap-1 transition-colors',
                    animo === o.value
                      ? 'border-accent bg-accent-soft'
                      : 'border-line bg-bg hover:border-line-2'
                  )}
                >
                  <span className="text-2xl">{o.emoji}</span>
                  <span className="text-[10px] font-medium text-muted">{o.label}</span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Energía · 1 a 10">
            <Scale10 value={energia} onChange={setEnergia} />
          </Field>

          <Field label="Deseo · 1 a 10">
            <Scale10 value={deseo} onChange={setDeseo} />
          </Field>

          <Field label="Presión laboral">
            <EnumPicker options={PRESION_OPTS} value={presion} onChange={setPresion} />
          </Field>

          <Field label="¿Algo que quieras decir? (opcional)">
            <Textarea
              rows={3}
              placeholder="Esta semana sentí que…"
              value={comentarios}
              onChange={e => setComentarios(e.target.value)}
            />
          </Field>

          {error && <p className="text-[13px] text-error font-medium">{error}</p>}

          <Button variant="accent" className="w-full py-3.5" onClick={nextFromStep1}>
            {hasPartner ? 'Continuar al paso 2 →' : 'Enviar checkin'}
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-7">
          <div className="card-warm">
            <p className="text-[13px] text-accent-deep">
              <strong className="font-semibold">Esto no califica a tu pareja.</strong>{' '}
              Captura cómo la viste tú esta semana. La diferencia con lo que ella sintió es información, no un veredicto.
            </p>
          </div>

          <Field label="¿Cómo viste su energía? · 1 a 10">
            <Scale10 value={partnerEnergia} onChange={setPartnerEnergia} />
          </Field>

          <Field label="¿Cómo viste su estrés / presión?">
            <EnumPicker options={PRESION_OPTS} value={partnerEstres} onChange={setPartnerEstres} />
          </Field>

          {error && <p className="text-[13px] text-error font-medium">{error}</p>}

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(1)}>
              ← Volver
            </Button>
            <Button variant="accent" className="flex-1 py-3.5" onClick={submit}>
              Enviar checkin
            </Button>
          </div>
          <button
            onClick={skipPartnerRating}
            className="block w-full text-center text-[13px] text-muted underline underline-offset-4 hover:text-ink"
          >
            Skip — solo enviar mi self-checkin
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Scale10({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="grid grid-cols-10 gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={cn(
            'aspect-square rounded-sm border font-mono text-[14px] font-medium transition-colors',
            value === n
              ? 'bg-ink text-bg border-ink'
              : 'bg-surface text-ink border-line hover:border-line-2'
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function EnumPicker<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            'py-2.5 rounded-sm border text-[12px] font-semibold uppercase tracking-wider transition-colors',
            value === opt
              ? 'bg-ink text-bg border-ink'
              : 'bg-surface text-ink border-line hover:border-line-2'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
