import Link from 'next/link';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { fmtRel } from '@/lib/utils/dates';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui';
import { PagosListRow } from './row';

export const metadata = { title: 'Ohana · Pagos' };
export const dynamic = 'force-dynamic';

type Pago = {
  id: string;
  nombre: string;
  monto: number;
  categoria: string | null;
  pagador_asignado: string | null;
  recurrencia: { value: number; unit: string } | null;
  due_date: string | null;
  pagado: boolean;
  pagado_en: string | null;
};

export default async function PagosPage() {
  const { supabase, couple, user } = await requireCoupleContext();

  const { data: pagos } = await supabase
    .from('pagos')
    .select('id, nombre, monto, categoria, pagador_asignado, recurrencia, due_date, pagado, pagado_en')
    .eq('couple_id', couple.id)
    .order('due_date', { ascending: true, nullsFirst: false })
    .returns<Pago[]>();

  const pendientes = (pagos ?? []).filter(p => !p.pagado);
  const pagados = (pagos ?? []).filter(p => p.pagado);
  const totalPendiente = pendientes.reduce((sum, p) => sum + Number(p.monto), 0);
  const totalPagado = pagados.reduce((sum, p) => sum + Number(p.monto), 0);

  return (
    <div className="px-5 py-8 md:px-10 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Pagos"
        title="Cuentas"
        titleAccent="de la casa"
        subtitle="Recurrentes y próximos vencimientos. Al marcar como pagado, el trigger genera la siguiente ocurrencia."
        actions={
          <Link href="/pagos/nuevo">
            <Button variant="accent" size="sm">+ Nuevo pago</Button>
          </Link>
        }
      />

      {/* Stats */}
      {pagos && pagos.length > 0 && (
        <div className="grid grid-cols-3 border border-line rounded-md overflow-hidden mb-8">
          <div className="p-4 border-r border-line">
            <div className="eyebrow text-[9px]">Pendientes</div>
            <div className="font-serif text-2xl mt-1 text-accent">
              ${totalPendiente.toLocaleString()}
            </div>
            <div className="meta mt-0.5">{pendientes.length} pagos</div>
          </div>
          <div className="p-4 border-r border-line">
            <div className="eyebrow text-[9px]">Pagados</div>
            <div className="font-serif text-2xl mt-1 text-success">
              ${totalPagado.toLocaleString()}
            </div>
            <div className="meta mt-0.5">{pagados.length} pagos</div>
          </div>
          <div className="p-4">
            <div className="eyebrow text-[9px]">Total mes</div>
            <div className="font-serif text-2xl mt-1">
              ${(totalPendiente + totalPagado).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {!pagos || pagos.length === 0 ? (
        <EmptyState
          title="Sin pagos registrados"
          description="Agrega tus pagos mensuales (renta, luz, internet, suscripciones)."
          action={
            <Link href="/pagos/nuevo">
              <Button variant="accent">Agregar primer pago</Button>
            </Link>
          }
        />
      ) : (
        <>
          {pendientes.length > 0 && (
            <section className="mb-8">
              <div className="eyebrow mb-3">Pendientes · {pendientes.length}</div>
              <div className="bg-surface border border-line rounded-md overflow-hidden">
                {pendientes.map((p, i) => (
                  <PagosListRow key={p.id} pago={p} isFirst={i === 0} />
                ))}
              </div>
            </section>
          )}

          {pagados.length > 0 && (
            <section>
              <div className="eyebrow mb-3">Pagados este ciclo · {pagados.length}</div>
              <div className="bg-surface border border-line rounded-md overflow-hidden">
                {pagados.map((p, i) => (
                  <PagosListRow key={p.id} pago={p} isFirst={i === 0} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
