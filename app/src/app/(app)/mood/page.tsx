import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MoodHeatmap } from '@/components/mood/heatmap';
import { MoodCaptureFull } from '@/components/mood/capture-full';
import { RealtimeRefresher } from '@/components/shared/realtime-refresher';
import { Button } from '@/components/ui';
import { partnerOf } from '@/lib/utils/partner';
import type { MoodEmocion } from '@/lib/types';

type MoodRow = {
  id: string;
  user_id: string;
  emocion: MoodEmocion;
  nota: string | null;
  created_at: string;
};

export const metadata = { title: 'Ohana · Mood' };
export const dynamic = 'force-dynamic';

export default async function MoodPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: couple } = await supabase
    .from('couples')
    .select('id, user_a_id, user_b_id')
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .single();

  if (!couple) redirect('/onboarding/espacio');

  const partnerId = partnerOf(couple, user.id);

  // Últimos 8 semanas de moods
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - 7 * 8);

  const { data: moods } = await supabase
    .from('mood_checkins')
    .select('id, user_id, emocion, nota, created_at')
    .eq('couple_id', couple.id)
    .gte('created_at', sinceDate.toISOString())
    .order('created_at', { ascending: true })
    .returns<MoodRow[]>();

  return (
    <div className="px-5 py-8 md:px-10 md:py-10 max-w-5xl mx-auto">
      <RealtimeRefresher
        subs={[{ table: 'mood_checkins', filter: `couple_id=eq.${couple.id}` }]}
      />
      <div className="flex justify-between items-baseline mb-8">
        <div>
          <div className="eyebrow text-accent">Mood ad-hoc</div>
          <h1 className="display text-3xl md:text-4xl mt-1">
            Su <em>pulso</em> emocional.
          </h1>
          <p className="italic-serif text-[15px] mt-2">
            Registros sin estructura, capturados en el momento. Sin notificaciones.
          </p>
        </div>
      </div>

      <MoodCaptureFull coupleId={couple.id} userId={user.id} />

      <div className="mt-10">
        <div className="eyebrow mb-3">Últimas 8 semanas</div>
        <MoodHeatmap moods={moods ?? []} myId={user.id} partnerId={partnerId} />
      </div>
    </div>
  );
}
