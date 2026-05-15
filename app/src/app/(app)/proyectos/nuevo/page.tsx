import { requireCoupleContext } from '@/lib/auth-helpers';
import { NewProyectoForm } from './form';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Ohana · Nuevo proyecto' };
export const dynamic = 'force-dynamic';

export default async function NuevoProyectoPage() {
  const { couple } = await requireCoupleContext();

  return (
    <div className="px-5 py-8 md:px-10 max-w-xl mx-auto">
      <PageHeader
        eyebrow="Nuevo proyecto"
        title="Algo"
        titleAccent="multi-mes"
        subtitle="Renovaciones, ahorros grandes, mudanzas. Lleva meta opcional y fecha objetivo."
      />
      <NewProyectoForm coupleId={couple.id} />
    </div>
  );
}
