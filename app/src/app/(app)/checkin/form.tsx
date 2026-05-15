'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Textarea, Scale10, EnumPicker, Field } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import type { EstadoAnimo, PresionTrabajo } from '@/lib/types';

type Step = 1 | 2 | 'submitting';

const ANIMO_OPTS: { value: EstadoAnimo; label: string; emoji: string }[] = [
  { value: 'feliz',    label: 'Feliz',    emoji: '😄' },
  { value: 'neutral',  label: 'Neutral',  emoji: '🙂' },
  { value: 'agotado',  label: 'Agotado',  emoji: '😴' },
  { value: 'triste',   label: 'Triste',   emoji: '😔' },
];

const PRESION_OPTS: readonly PresionTrabajo[] = ['baja', 'mediana', 'alta', 'extrema'];

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

  const [animo, setAnimo] = useState<EstadoAnimo | null>(null);
  const [energia, setEnergia] = useState<number | null>(null);
  const [deseo, setDeseo] = useState<number | null>(null);
  const [presion, setPresion] = useState<PresionTrabajo | null>(null);
  const [comentarios, setComentarios] = useState('');
  const [partnerEnergia, setPartnerEnergia] = useState<number | null>(null);
  const [partnerEstres, setPartnerEstres] = useState<PresionTrabajo | null>(null);

  const [error, setError] = useState<string | null>(null);

  const step1Complete = !!(animo && energia && deseo && presion);

  function nextFromStep1() {
    if (!step1Complete) {
      setError('Llena ánimo, energía, deseo y presión laboral.');
      return;
    }
    setError(null);
    if (hasPartner) setStep(2);
    else submit();
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
    <div className="px-5 py-8 md:px-10 max-w-2xl mx-auto pb-32">
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
                  type="button"
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

          <FieldWithIcon icon="⚡" label="Energía · 1 a 10" hint="Tu sensación general de empuje.">
            <Scale10 value={energia} onChange={setEnergia} />
          </FieldWithIcon>

          <FieldWithIcon icon="🔥" label="Deseo · 1 a 10" hint="Tu deseo sexual esta semana.">
            <Scale10 value={deseo} onChange={setDeseo} />
          </FieldWithIcon>

          <FieldWithIcon icon="💼" label="Presión laboral" hint="Qué tan demandante estuvo tu trabajo.">
            <EnumPicker options={PRESION_OPTS} value={presion} onChange={setPresion} />
          </FieldWithIcon>

          <Field label="¿Algo que quieras decir? (opcional)">
            <Textarea
              rows={3}
              placeholder="Esta semana sentí que…"
              value={comentarios}
              onChange={e => setComentarios(e.target.value)}
            />
          </Field>

          {error && <p className="text-[13px] text-error font-medium">{error}</p>}
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

          <FieldWithIcon icon="⚡" label="¿Cómo viste su energía? · 1 a 10">
            <Scale10 value={partnerEnergia} onChange={setPartnerEnergia} />
          </FieldWithIcon>

          <FieldWithIcon icon="💼" label="¿Cómo viste su estrés / presión?">
            <EnumPicker options={PRESION_OPTS} value={partnerEstres} onChange={setPartnerEstres} />
          </FieldWithIcon>

          {error && <p className="text-[13px] text-error font-medium">{error}</p>}

          <button
            onClick={submit}
            className="block w-full text-center text-[13px] text-muted underline underline-offset-4 hover:text-ink mt-4"
          >
            Skip — solo enviar mi self-checkin
          </button>
        </div>
      )}

      {/* Floating submit · pinned above mobile bottom nav, normal en desktop */}
      <div className="fixed bottom-[76px] md:bottom-6 inset-x-0 z-30 px-5 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <div className="bg-bg/95 backdrop-blur border border-line shadow-lg rounded-md p-2 flex gap-2">
            {step === 2 && (
              <Button
                variant="ghost"
                onClick={() => { setStep(1); setError(null); }}
              >
                ← Volver
              </Button>
            )}
            <Button
              variant="accent"
              className="flex-1 py-3"
              onClick={step === 1 ? nextFromStep1 : submit}
              disabled={step === 1 && !step1Complete}
            >
              {step === 1
                ? hasPartner
                  ? 'Continuar al paso 2 →'
                  : 'Enviar checkin'
                : 'Enviar checkin'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldWithIcon({
  icon,
  label,
  hint,
  children,
}: {
  icon: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl leading-none" aria-hidden>{icon}</span>
        <label className="text-[11px] font-sans font-semibold uppercase tracking-[0.08em] text-muted">
          {label}
        </label>
      </div>
      {children}
      {hint && <p className="meta mt-1.5">{hint}</p>}
    </div>
  );
}
