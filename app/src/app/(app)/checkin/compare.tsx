'use client';

import { Card } from '@/components/ui';
import { fmtDate, parseISO } from '@/lib/utils/dates';

type Checkin = {
  id: string;
  user_id: string;
  energia: number | null;
  deseo: number | null;
  estado_animo: string | null;
  presion_trabajo: string | null;
  comentarios: string | null;
  partner_energia_percibida: number | null;
  partner_estres_percibido: string | null;
  submitted_at: string;
};

const animoEmoji: Record<string, string> = {
  feliz: '😄', neutral: '🙂', agotado: '😴', triste: '😔',
};

const presionLevel: Record<string, number> = {
  baja: 1, mediana: 2, alta: 3, extrema: 4,
};

export function CheckinCompare({
  myCheckin,
  partnerCheckin,
  myId,
  partnerId,
  history,
}: {
  myCheckin: Checkin;
  partnerCheckin: Checkin;
  myId: string;
  partnerId: string;
  history: { user_id: string; week_of: string; energia: number | null; partner_energia_percibida: number | null }[];
}) {
  // Divergencias self vs partner-rating
  const partnerRatedMyEnergia = partnerCheckin.partner_energia_percibida;
  const myRatedPartnerEnergia = myCheckin.partner_energia_percibida;
  const energiaDivergenceMine = myCheckin.energia && partnerRatedMyEnergia
    ? Math.abs(myCheckin.energia - partnerRatedMyEnergia)
    : null;
  const energiaDivergencePartner = partnerCheckin.energia && myRatedPartnerEnergia
    ? Math.abs(partnerCheckin.energia - myRatedPartnerEnergia)
    : null;

  const presionDivergenceMine = myCheckin.presion_trabajo && partnerCheckin.partner_estres_percibido
    ? Math.abs(presionLevel[myCheckin.presion_trabajo] - presionLevel[partnerCheckin.partner_estres_percibido])
    : null;

  return (
    <div className="px-5 py-8 md:px-10 max-w-5xl mx-auto">
      <div className="eyebrow text-accent">Checkin · ambos completaron</div>
      <h1 className="display text-3xl md:text-4xl mt-1">
        Semana <em>{fmtDate(myCheckin.submitted_at, "'sem' w")}</em>.
      </h1>
      <p className="italic-serif text-[15px] mt-2 mb-8">
        Lo que cada uno reportó, y cómo se vieron entre sí.
      </p>

      {/* Self-checkin side by side */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <SelfCard
          who="Tú"
          checkin={myCheckin}
        />
        <SelfCard
          who="Tu pareja"
          checkin={partnerCheckin}
        />
      </div>

      {/* Partner-rating divergences */}
      <div className="mb-8">
        <div className="eyebrow mb-3">Cómo se vieron entre sí</div>
        <div className="grid md:grid-cols-2 gap-4">
          <DivergenceCard
            who="Tú"
            selfEnergia={myCheckin.energia}
            partnerRatedEnergia={partnerCheckin.partner_energia_percibida}
            selfPresion={myCheckin.presion_trabajo}
            partnerRatedPresion={partnerCheckin.partner_estres_percibido}
            divergence={energiaDivergenceMine}
          />
          <DivergenceCard
            who="Tu pareja"
            selfEnergia={partnerCheckin.energia}
            partnerRatedEnergia={myCheckin.partner_energia_percibida}
            selfPresion={partnerCheckin.presion_trabajo}
            partnerRatedPresion={myCheckin.partner_estres_percibido}
            divergence={energiaDivergencePartner}
          />
        </div>
      </div>

      {/* Trend 8 semanas (placeholder visual) */}
      <Card>
        <div className="eyebrow mb-1">Tendencia · últimas 8 semanas</div>
        <p className="italic-serif text-[14px] mb-3">
          Self-energía vs partner-perception, los dos.
        </p>
        <TrendChart history={history} myId={myId} partnerId={partnerId} />
      </Card>
    </div>
  );
}

function SelfCard({ who, checkin }: { who: string; checkin: Checkin }) {
  return (
    <Card>
      <div className="eyebrow">
        {who} · enviado {fmtDate(checkin.submitted_at, "EEE HH:mm")}
      </div>
      <div className="h1 text-xl mt-2">
        {checkin.estado_animo && animoEmoji[checkin.estado_animo]}{' '}
        {checkin.estado_animo} · energía {checkin.energia}
      </div>
      <div className="meta mt-1">
        Deseo {checkin.deseo} · presión {checkin.presion_trabajo}
      </div>
      {checkin.comentarios && (
        <>
          <hr className="my-3 border-line" />
          <p className="italic-serif text-[15px] leading-relaxed">"{checkin.comentarios}"</p>
        </>
      )}
    </Card>
  );
}

function DivergenceCard({
  who,
  selfEnergia,
  partnerRatedEnergia,
  selfPresion,
  partnerRatedPresion,
  divergence,
}: {
  who: string;
  selfEnergia: number | null;
  partnerRatedEnergia: number | null;
  selfPresion: string | null;
  partnerRatedPresion: string | null;
  divergence: number | null;
}) {
  const significant = divergence !== null && divergence >= 3;

  return (
    <Card className={significant ? 'border-accent border-2' : ''}>
      <div className="eyebrow">{who}</div>
      <div className="mt-3 space-y-2 text-[14px]">
        <Row
          label="Energía"
          self={selfEnergia?.toString()}
          rated={partnerRatedEnergia?.toString()}
          highlight={significant}
        />
        <Row
          label="Presión / estrés"
          self={selfPresion}
          rated={partnerRatedPresion}
          highlight={false}
        />
      </div>
      {significant && (
        <p className="italic-serif text-[13px] text-accent-deep mt-3 border-t border-accent-soft pt-2">
          Se vieron diferente esta semana. ¿Vale platicarlo?
        </p>
      )}
    </Card>
  );
}

function Row({
  label,
  self,
  rated,
  highlight,
}: {
  label: string;
  self: string | null | undefined;
  rated: string | null | undefined;
  highlight: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline gap-2">
      <span className="meta">{label}</span>
      <div className="flex gap-3 items-baseline">
        <span>Tú: <strong className="font-semibold">{self ?? '—'}</strong></span>
        <span className={highlight ? 'text-accent font-semibold' : ''}>
          Partner: <strong className="font-semibold">{rated ?? '—'}</strong>
        </span>
      </div>
    </div>
  );
}

function TrendChart({
  history,
  myId,
  partnerId,
}: {
  history: { user_id: string; week_of: string; energia: number | null; partner_energia_percibida: number | null }[];
  myId: string;
  partnerId: string;
}) {
  const myHistory = history.filter(h => h.user_id === myId);
  const partnerHistory = history.filter(h => h.user_id === partnerId);

  if (myHistory.length < 2) {
    return <p className="meta text-center py-6">Necesitas más semanas para ver tendencia.</p>;
  }

  // Simple bar viz (no chart lib needed yet)
  return (
    <div className="grid grid-cols-8 gap-2 items-end h-24">
      {myHistory.slice(-8).map((h, i) => (
        <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
          <div
            className="w-full bg-accent rounded-sm"
            style={{ height: `${(h.energia ?? 0) * 10}%` }}
          />
          <span className="meta text-[9px]">S{i + 1}</span>
        </div>
      ))}
    </div>
  );
}
