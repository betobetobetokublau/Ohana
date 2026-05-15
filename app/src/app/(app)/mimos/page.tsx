import Link from 'next/link';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { fmtDate } from '@/lib/utils/dates';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { RealtimeRefresher } from '@/components/shared/realtime-refresher';
import { Button, Card, Pill } from '@/components/ui';
import type { MimoEmocion } from '@/lib/types';

export const metadata = { title: 'Ohana · Mimos' };
export const dynamic = 'force-dynamic';

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
  revealed_in_session_id: string | null;
  created_at: string;
};

export default async function MimosPage() {
  const { supabase, user, couple } = await requireCoupleContext();

  // Mimos del mes actual (aún no revelados)
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [{ data: myThisMonth }, { data: revealedMimos }] = await Promise.all([
    supabase
      .from('mimos')
      .select('id, autor_id, titulo, descripcion, emocion_asociada, revealed_in_session_id, created_at')
      .eq('couple_id', couple.id)
      .eq('autor_id', user.id)
      .is('revealed_in_session_id', null)
      .gte('created_at', firstOfMonth)
      .order('created_at', { ascending: false })
      .returns<Mimo[]>(),
    supabase
      .from('mimos')
      .select('id, autor_id, titulo, descripcion, emocion_asociada, revealed_in_session_id, created_at')
      .eq('couple_id', couple.id)
      .not('revealed_in_session_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20)
      .returns<Mimo[]>(),
  ]);

  // Para sesión actual, contar cuántos lleva cada uno (sin ver el contenido del otro)
  const { count: partnerCount } = await supabase
    .from('mimos')
    .select('id', { count: 'exact', head: true })
    .eq('couple_id', couple.id)
    .neq('autor_id', user.id)
    .is('revealed_in_session_id', null)
    .gte('created_at', firstOfMonth);

  return (
    <div className="px-5 py-8 md:px-10 max-w-4xl mx-auto">
      <RealtimeRefresher
        subs={[{ table: 'mimos', filter: `couple_id=eq.${couple.id}` }]}
      />
      <PageHeader
        eyebrow="Mimos"
        title="Pequeños"
        titleAccent="aprecios"
        subtitle="Privados al autor hasta la sesión mensual. Una ceremonia compartida, no notificaciones."
        actions={
          <>
            <Link href="/mimos/nuevo">
              <Button variant="accent" size="sm">+ Nuevo mimo</Button>
            </Link>
            <Link href="/mimos/sesion">
              <Button variant="ghost" size="sm">Sesión mensual</Button>
            </Link>
          </>
        }
      />

      {/* Estado del mes actual */}
      <section className="mb-10">
        <div className="card-warm flex items-center justify-between gap-4">
          <div>
            <div className="eyebrow text-accent-deep">Mes actual · oculto hasta sesión</div>
            <div className="h1 text-2xl mt-1">
              {myThisMonth?.length ?? 0} + {partnerCount ?? 0} mimos en proceso
            </div>
            <p className="italic-serif text-[13px] mt-1.5">
              Tú agregaste {myThisMonth?.length ?? 0}. Tu pareja agregó {partnerCount ?? 0}. Se revelan juntos.
            </p>
          </div>
        </div>
      </section>

      {/* Tus mimos del mes (preview privado) */}
      {myThisMonth && myThisMonth.length > 0 && (
        <section className="mb-10">
          <div className="eyebrow mb-3">Los tuyos · solo tú los ves</div>
          <div className="grid sm:grid-cols-2 gap-3">
            {myThisMonth.map(m => (
              <Card key={m.id}>
                {m.emocion_asociada && (
                  <Pill variant="accent" className="mb-2">
                    {EMOCION_LABEL[m.emocion_asociada]}
                  </Pill>
                )}
                <div className="font-serif italic text-lg leading-snug">{m.titulo}</div>
                {m.descripcion && (
                  <p className="meta mt-2 line-clamp-2">{m.descripcion}</p>
                )}
                <div className="meta mt-2">{fmtDate(m.created_at)}</div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Archivo · mimos ya revelados */}
      <section>
        <div className="eyebrow mb-3">Archivo · revelados</div>
        {!revealedMimos || revealedMimos.length === 0 ? (
          <EmptyState
            title="Aún no hay archivo"
            description="Cuando tengan su primera sesión mensual, los mimos revelados quedarán aquí ordenados."
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {revealedMimos.map(m => (
              <Card key={m.id}>
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  {m.emocion_asociada && (
                    <Pill variant="accent">{EMOCION_LABEL[m.emocion_asociada]}</Pill>
                  )}
                  <span className="meta">{m.autor_id === user.id ? 'tú' : 'pareja'}</span>
                </div>
                <div className="font-serif italic text-lg leading-snug">{m.titulo}</div>
                {m.descripcion && (
                  <p className="text-[13px] mt-2 leading-relaxed">{m.descripcion}</p>
                )}
                <div className="meta mt-2">{fmtDate(m.created_at)}</div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
