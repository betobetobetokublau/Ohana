import { requireCoupleContext } from '@/lib/auth-helpers';
import { NewIdeaForm } from './form';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Ohana · Nueva idea de cita' };
export const dynamic = 'force-dynamic';

export default async function NuevaIdeaPage() {
  const { couple } = await requireCoupleContext();

  return (
    <div className="px-5 py-8 md:px-10 max-w-xl mx-auto">
      <PageHeader
        eyebrow="Nueva idea"
        title="Agrégala"
        titleAccent="a la biblioteca"
        subtitle="Una actividad, evento o plan que quieran hacer alguna vez."
      />
      <NewIdeaForm coupleId={couple.id} />
    </div>
  );
}
