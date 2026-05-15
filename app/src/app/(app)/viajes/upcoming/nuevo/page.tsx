import { requireCoupleContext } from '@/lib/auth-helpers';
import { NewUpcomingForm } from './form';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Ohana · Planear viaje' };
export const dynamic = 'force-dynamic';

export default async function NewUpcomingPage() {
  const { couple } = await requireCoupleContext();

  return (
    <div className="px-5 py-8 md:px-10 max-w-xl mx-auto">
      <PageHeader
        eyebrow="Próximo viaje"
        title="Planear"
        titleAccent="el viaje"
        subtitle="Presupuesto, fechas y características. Las revisiones se llenan después del viaje."
      />
      <NewUpcomingForm coupleId={couple.id} />
    </div>
  );
}
