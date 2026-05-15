import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fmtWeekOf } from '@/lib/utils/dates';
import { partnerOf } from '@/lib/utils/partner';
import { CheckinForm } from './form';
import { CheckinCompare } from './compare';

export const metadata = { title: 'Ohana · Checkin semanal' };
export const dynamic = 'force-dynamic';

export default async function CheckinPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: couple } = await supabase
    .from('couples')
    .select('id, user_a_id, user_b_id, display_name')
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .single();

  if (!couple) redirect('/onboarding/espacio');
  const partnerId = partnerOf(couple, user.id);

  const weekOf = fmtWeekOf();

  // Mi checkin de esta semana
  const { data: myCheckin } = await supabase
    .from('checkins')
    .select('*')
    .eq('couple_id', couple.id)
    .eq('user_id', user.id)
    .eq('week_of', weekOf)
    .maybeSingle();

  // Checkin de la pareja
  const { data: partnerCheckin } = partnerId
    ? await supabase
        .from('checkins')
        .select('*')
        .eq('couple_id', couple.id)
        .eq('user_id', partnerId)
        .eq('week_of', weekOf)
        .maybeSingle()
    : { data: null };

  // Si ambos enviaron, mostrar comparativa
  if (myCheckin && partnerCheckin) {
    // Trend de 8 semanas
    const { data: history } = await supabase
      .from('checkins')
      .select('user_id, week_of, energia, partner_energia_percibida')
      .eq('couple_id', couple.id)
      .order('week_of', { ascending: true })
      .limit(16);

    return (
      <CheckinCompare
        myCheckin={myCheckin}
        partnerCheckin={partnerCheckin}
        myId={user.id}
        partnerId={partnerId!}
        history={history ?? []}
      />
    );
  }

  // Si yo ya envié pero la pareja no
  if (myCheckin && !partnerCheckin) {
    return (
      <div className="px-5 py-12 md:px-10 max-w-2xl mx-auto text-center">
        <div className="eyebrow text-accent mb-2">Esperando a tu pareja</div>
        <h1 className="display text-3xl">Tu checkin <em>está enviado</em>.</h1>
        <p className="italic-serif text-[15px] mt-4 max-w-md mx-auto">
          Cuando tu pareja envíe el suyo, se desbloquea la comparativa para los dos.
          No verás su respuesta antes para no influenciarla.
        </p>
      </div>
    );
  }

  // Si nadie ha enviado o solo la pareja envió → mostrar form
  return (
    <CheckinForm
      coupleId={couple.id}
      userId={user.id}
      weekOf={weekOf}
      hasPartner={!!partnerId}
    />
  );
}
