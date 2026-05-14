import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fmtWeekOf, greeting, fmtRel } from '@/lib/utils/dates';
import { MoodSparkline } from '@/components/mood/sparkline';
import { MoodQuickCapture } from '@/components/mood/quick-capture';
import { Card, CardIconRow, CardIcon, Button, Pill, Dot } from '@/components/ui';
import Link from 'next/link';
import { CheckCircle2, Heart } from 'lucide-react';

export const metadata = { title: 'Ohana · Hoy' };
export const dynamic = 'force-dynamic';

export default async function HoyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userRow } = await supabase
    .from('users')
    .select('id, display_name')
    .eq('id', user.id)
    .single();

  const { data: couple } = await supabase
    .from('couples')
    .select('id, user_a_id, user_b_id')
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .single();

  if (!couple) redirect('/onboarding/espacio');

  const partnerId = couple.user_a_id === user.id ? couple.user_b_id : couple.user_a_id;

  // Checkin semanal pendiente?
  const weekOf = fmtWeekOf();
  const { data: thisWeekCheckin } = await supabase
    .from('checkins')
    .select('id, submitted_at')
    .eq('couple_id', couple.id)
    .eq('user_id', user.id)
    .eq('week_of', weekOf)
    .maybeSingle();

  // Cita en proceso esta semana?
  const { data: propuesta } = await supabase
    .from('citas_propuestas')
    .select('id, votos_user_a, votos_user_b, consenso_idea_id')
    .eq('couple_id', couple.id)
    .eq('semana', weekOf)
    .maybeSingle();

  const myVotes = couple.user_a_id === user.id ? propuesta?.votos_user_a : propuesta?.votos_user_b;
  const haveIvoted = !!myVotes && myVotes.length > 0;

  // Pendientes top 3
  const { data: pendientes } = await supabase
    .from('accionables')
    .select('id, titulo, tipo, due_date')
    .eq('couple_id', couple.id)
    .eq('asignado_user_id', user.id)
    .is('completado_at', null)
    .order('due_date', { ascending: true })
    .limit(3);

  // Mood ad-hoc · últimos 7 días, propios + partner
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: moods } = await supabase
    .from('mood_checkins')
    .select('id, user_id, emocion, nota, created_at')
    .eq('couple_id', couple.id)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  const name = userRow?.display_name || user.email?.split('@')[0] || 'tú';

  const tipoColor: Record<string, string> = {
    pago: 'hsl(var(--mod-gastos))',
    mantenimiento: 'hsl(var(--mod-mant))',
    proyecto: 'hsl(var(--mod-proyectos))',
    viaje: 'hsl(var(--mod-viajes))',
    saludsexual: 'hsl(var(--mod-salud))',
    discusion: 'hsl(var(--mod-discus))',
    revision: 'hsl(var(--mod-salud))',
  };

  return (
    <div className="px-5 py-8 md:px-10 md:py-10 max-w-3xl mx-auto">
      <div className="eyebrow text-accent mb-2">Hoy</div>
      <h1 className="display text-3xl md:text-4xl">
        {greeting()}, <em>{name}</em>.
      </h1>
      <p className="italic-serif text-[15px] mt-2 mb-7">
        {pendientes && pendientes.length > 0
          ? `${pendientes.length} pendiente${pendientes.length === 1 ? '' : 's'} esta semana`
          : 'Todo está en su lugar. Disfruta el día.'}
        {!thisWeekCheckin && ', tu checkin sigue pendiente.'}
      </p>

      <div className="space-y-3">
        {/* Checkin card */}
        {!thisWeekCheckin && (
          <Card className="card-warm">
            <CardIconRow>
              <CardIcon style={{ backgroundColor: 'hsl(var(--accent))' }}>⊙</CardIcon>
              <div>
                <div className="eyebrow text-accent-deep">Esta semana · vence dom</div>
                <div className="h1 text-lg mt-1.5">Tu checkin semanal</div>
                <Link href="/checkin">
                  <Button variant="accent" size="sm" className="mt-2.5">
                    Empezar · 2 min
                  </Button>
                </Link>
              </div>
            </CardIconRow>
          </Card>
        )}

        {/* Cita card */}
        {propuesta && !propuesta.consenso_idea_id && !haveIvoted && (
          <Card>
            <CardIconRow>
              <CardIcon style={{ backgroundColor: 'hsl(var(--mod-citas))' }}>
                <Heart className="w-5 h-5" />
              </CardIcon>
              <div>
                <div className="eyebrow">Vota la cita de la semana</div>
                <div className="text-[14px] mt-1">3 propuestas listas.</div>
                <Link href="/citas/votar">
                  <Button variant="ghost" size="sm" className="mt-2">
                    Ver propuestas
                  </Button>
                </Link>
              </div>
            </CardIconRow>
          </Card>
        )}

        {/* Pendientes */}
        {pendientes && pendientes.length > 0 && (
          <Card>
            <CardIconRow>
              <CardIcon style={{ backgroundColor: 'hsl(var(--ink))' }}>
                <CheckCircle2 className="w-5 h-5" />
              </CardIcon>
              <div>
                <div className="eyebrow">Tus pendientes</div>
                <div className="mt-2 space-y-1.5">
                  {pendientes.map(p => (
                    <div key={p.id} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 border border-line-2 rounded-sm bg-bg" />
                      <Dot color={tipoColor[p.tipo] || 'hsl(var(--ink))'} />
                      <span className="text-[14px] font-medium flex-1 truncate">{p.titulo}</span>
                      {p.due_date && (
                        <span className="meta">{fmtRel(p.due_date)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardIconRow>
          </Card>
        )}
      </div>

      {/* Mood section */}
      <div className="mt-10">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="eyebrow">Mood · últimos 7 días</div>
            <p className="italic-serif text-[14px] mt-0.5">
              Tu pulso y el de tu pareja.
            </p>
          </div>
          <Link href="/mood">
            <Button variant="ghost" size="sm">Ver heatmap</Button>
          </Link>
        </div>
        <MoodSparkline moods={moods ?? []} myId={user.id} partnerId={partnerId} />
        <MoodQuickCapture coupleId={couple.id} userId={user.id} />
      </div>
    </div>
  );
}
