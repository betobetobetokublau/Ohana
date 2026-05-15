import { requireCoupleContext } from '@/lib/auth-helpers';
import { NewFechaForm } from './form';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Ohana · Nueva fecha clave' };
export const dynamic = 'force-dynamic';

export default async function NuevaFechaPage() {
  const { couple } = await requireCoupleContext();

  return (
    <div className="px-5 py-8 md:px-10 max-w-xl mx-auto">
      <PageHeader
        eyebrow="Nueva fecha clave"
        title="Algo que se"
        titleAccent="celebra"
        subtitle="Aniversarios, cumpleaños, primeras veces, hitos. Recordatorio 7 días antes."
      />
      <NewFechaForm coupleId={couple.id} />
    </div>
  );
}
