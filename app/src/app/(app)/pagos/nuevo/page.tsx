import { requireCoupleContext } from '@/lib/auth-helpers';
import { NewPagoForm } from './form';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Ohana · Nuevo pago' };
export const dynamic = 'force-dynamic';

export default async function NuevoPagoPage() {
  const { supabase, couple } = await requireCoupleContext();

  const { data: users } = await supabase
    .from('users')
    .select('id, display_name')
    .or(`id.eq.${couple.user_a_id},id.eq.${couple.user_b_id ?? couple.user_a_id}`);

  return (
    <div className="px-5 py-8 md:px-10 max-w-xl mx-auto">
      <PageHeader
        eyebrow="Nuevo pago"
        title="Una cuenta"
        titleAccent="recurrente"
        subtitle="Renta, luz, internet, suscripciones. Si tiene recurrencia, Supabase regenera la siguiente al marcarlo pagado."
      />
      <NewPagoForm coupleId={couple.id} users={users ?? []} />
    </div>
  );
}
