import { requireCoupleContext } from '@/lib/auth-helpers';
import { NewRevisionForm } from './form';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Ohana · Programar revisión médica' };
export const dynamic = 'force-dynamic';

export default async function NuevaRevisionPage() {
  const { supabase, couple } = await requireCoupleContext();

  const { data: users } = await supabase
    .from('users')
    .select('id, display_name')
    .or(`id.eq.${couple.user_a_id},id.eq.${couple.user_b_id ?? couple.user_a_id}`);

  return (
    <div className="px-5 py-8 md:px-10 max-w-xl mx-auto">
      <PageHeader
        eyebrow="Programar revisión"
        title="Revisión"
        titleAccent="médica"
        subtitle="Tamizaje ITS, papanicolaou, chequeos. 7 días antes les llega recordatorio."
      />
      <NewRevisionForm coupleId={couple.id} users={users ?? []} />
    </div>
  );
}
