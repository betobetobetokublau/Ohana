import { requireCoupleContext } from '@/lib/auth-helpers';
import { NewAcuerdoForm } from './form';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Ohana · Nuevo acuerdo' };
export const dynamic = 'force-dynamic';

export default async function NuevoAcuerdoPage() {
  const { couple, user } = await requireCoupleContext();

  return (
    <div className="px-5 py-8 md:px-10 max-w-xl mx-auto">
      <PageHeader
        eyebrow="Nuevo acuerdo"
        title="Algo que"
        titleAccent="decidieron juntos"
        subtitle="Describir el acuerdo con tus propias palabras. Lo pueden editar después."
      />
      <NewAcuerdoForm coupleId={couple.id} userId={user.id} />
    </div>
  );
}
