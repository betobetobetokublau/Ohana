import Link from 'next/link';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { isUserA as checkUserA, partnerOf } from '@/lib/utils/partner';
import { fmtDate, fmtRel } from '@/lib/utils/dates';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button, Card, Pill } from '@/components/ui';

export const metadata = { title: 'Ohana · Viajes' };
export const dynamic = 'force-dynamic';

type Wish = {
  id: string;
  nombre: string;
  descripcion: string | null;
  tipo: 'viaje' | 'evento' | null;
  agregado_por: string | null;
  interes_user_a: number | null;
  interes_user_b: number | null;
};

type Upcoming = {
  id: string;
  nombre: string;
  presupuesto: number | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  caracteristicas: string | null;
  revisiones: string | null;
};

export default async function ViajesPage() {
  const { supabase, user, couple } = await requireCoupleContext();
  const isUserA = checkUserA(couple, user.id);

  const [{ data: wishlist }, { data: upcoming }] = await Promise.all([
    supabase
      .from('viajes_wishlist')
      .select('id, nombre, descripcion, tipo, agregado_por, interes_user_a, interes_user_b')
      .eq('couple_id', couple.id)
      .order('nombre', { ascending: true })
      .returns<Wish[]>(),
    supabase
      .from('viajes_eventos')
      .select('id, nombre, presupuesto, fecha_inicio, fecha_fin, caracteristicas, revisiones')
      .eq('couple_id', couple.id)
      .order('fecha_inicio', { ascending: true, nullsFirst: false })
      .returns<Upcoming[]>(),
  ]);

  const now = new Date();
  const proximos = (upcoming ?? []).filter(
    v => v.fecha_inicio && new Date(v.fecha_inicio) >= now
  );
  const pasados = (upcoming ?? []).filter(
    v => v.fecha_fin && new Date(v.fecha_fin) < now
  );

  return (
    <div className="px-5 py-8 md:px-10 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Viajes y eventos"
        title="A dónde"
        titleAccent="quieren ir"
        subtitle="Wishlist con interés por persona. Próximos viajes planeados. Pasados con revisión."
        actions={
          <>
            <Link href="/viajes/wishlist/nuevo">
              <Button variant="accent" size="sm">+ Wishlist</Button>
            </Link>
            <Link href="/viajes/upcoming/nuevo">
              <Button variant="ghost" size="sm">+ Próximo</Button>
            </Link>
          </>
        }
      />

      {/* Próximos */}
      {proximos.length > 0 && (
        <section className="mb-10">
          <div className="eyebrow mb-3">Próximos viajes · {proximos.length}</div>
          <div className="space-y-3">
            {proximos.map(v => (
              <Card key={v.id} className="card-warm">
                <div className="flex justify-between items-baseline">
                  <div>
                    <div className="font-serif text-xl">{v.nombre}</div>
                    {v.fecha_inicio && (
                      <div className="meta mt-1">
                        {fmtDate(v.fecha_inicio)}
                        {v.fecha_fin && ` → ${fmtDate(v.fecha_fin)}`}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    {v.presupuesto && (
                      <div className="font-mono text-[15px] font-medium">
                        ${Number(v.presupuesto).toLocaleString()}
                      </div>
                    )}
                    {v.fecha_inicio && (
                      <div className="meta text-accent-deep">{fmtRel(v.fecha_inicio)}</div>
                    )}
                  </div>
                </div>
                {v.caracteristicas && (
                  <p className="italic-serif text-[14px] mt-3">{v.caracteristicas}</p>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Wishlist */}
      <section className="mb-10">
        <div className="eyebrow mb-3">Wishlist · {wishlist?.length ?? 0}</div>
        {!wishlist || wishlist.length === 0 ? (
          <EmptyState
            title="Sin wishlist"
            description="Lugares y eventos que les gustaría visitar alguna vez."
            action={
              <Link href="/viajes/wishlist/nuevo">
                <Button variant="accent">+ Agregar a wishlist</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {wishlist.map(w => {
              const myInterest = isUserA ? w.interes_user_a : w.interes_user_b;
              const partnerInterest = isUserA ? w.interes_user_b : w.interes_user_a;
              return (
                <Card key={w.id}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-serif text-lg">{w.nombre}</div>
                    {w.tipo && <Pill>{w.tipo}</Pill>}
                  </div>
                  {w.descripcion && (
                    <p className="meta line-clamp-2 mb-3">{w.descripcion}</p>
                  )}
                  <div className="flex justify-between font-mono text-[11px] text-muted">
                    <span>Tú: {myInterest ? '★'.repeat(myInterest) : '—'}</span>
                    <span>Pareja: {partnerInterest ? '★'.repeat(partnerInterest) : '—'}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Pasados */}
      {pasados.length > 0 && (
        <section>
          <div className="eyebrow mb-3">Pasados · {pasados.length}</div>
          <div className="space-y-2">
            {pasados.map(v => (
              <Card key={v.id} className="opacity-70">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{v.nombre}</div>
                    {v.fecha_inicio && (
                      <div className="meta">{fmtDate(v.fecha_inicio)}</div>
                    )}
                  </div>
                  {v.revisiones && <Pill variant="success">con notas</Pill>}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
