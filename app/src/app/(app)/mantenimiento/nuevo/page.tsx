import { requireCoupleContext } from '@/lib/auth-helpers';
import { NewMantForm } from './form';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Ohana · Nueva tarea de mantenimiento' };
export const dynamic = 'force-dynamic';

export default async function NuevaMantPage() {
  const { supabase, couple } = await requireCoupleContext();

  const { data: users } = await supabase
    .from('users')
    .select('id, display_name')
    .or(`id.eq.${couple.user_a_id},id.eq.${couple.user_b_id ?? couple.user_a_id}`);

  return (
    <div className="px-5 py-8 md:px-10 max-w-xl mx-auto">
      <PageHeader
        eyebrow="Nueva tarea"
        title="Algo del"
        titleAccent="depa"
        subtitle="Única o recurrente. Si es recurrente, al completar se regenera la siguiente automáticamente."
      />
      <NewMantForm coupleId={couple.id} users={users ?? []} />
    </div>
  );
}
