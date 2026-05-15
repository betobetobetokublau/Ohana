import { requireCoupleContext } from '@/lib/auth-helpers';
import { NewTemaForm } from './form';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Ohana · Nuevo tema' };
export const dynamic = 'force-dynamic';

export default async function NuevoTemaPage() {
  const { couple } = await requireCoupleContext();

  return (
    <div className="px-5 py-8 md:px-10 max-w-xl mx-auto">
      <PageHeader
        eyebrow="Nuevo tema"
        title="Algo que tienen"
        titleAccent="que platicar"
        subtitle="Un tema empieza abierto. Puede tener varias discusiones a lo largo del tiempo. Eventualmente se resuelve creando un acuerdo formal."
      />
      <NewTemaForm coupleId={couple.id} />
    </div>
  );
}
