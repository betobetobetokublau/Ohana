import { requireCoupleContext } from '@/lib/auth-helpers';
import { NewEventoForm } from './form';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Ohana · Nuevo evento de salud sexual' };
export const dynamic = 'force-dynamic';

export default async function NuevoEventoPage() {
  const { couple } = await requireCoupleContext();

  return (
    <div className="px-5 py-8 md:px-10 max-w-xl mx-auto">
      <PageHeader
        eyebrow="Nuevo evento"
        title="Registro"
        titleAccent="íntimo"
        subtitle="Evento (en casa) o salida (fuera). Privado entre los dos. La nota es libre."
      />
      <NewEventoForm coupleId={couple.id} />
    </div>
  );
}
