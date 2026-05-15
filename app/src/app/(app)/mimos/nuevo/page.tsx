import { redirect } from 'next/navigation';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { NewMimoForm } from './form';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Ohana · Nuevo mimo' };
export const dynamic = 'force-dynamic';

export default async function NuevoMimoPage() {
  const { couple, user, partnerId } = await requireCoupleContext();
  if (!partnerId) redirect('/onboarding/invitar');

  return (
    <div className="px-5 py-8 md:px-10 max-w-xl mx-auto">
      <PageHeader
        eyebrow="Nuevo mimo · privado"
        title="Anota un"
        titleAccent="detalle"
        subtitle="Tu pareja lo verá en la sesión mensual. Hasta entonces, es solo tuyo."
      />
      <NewMimoForm
        coupleId={couple.id}
        userId={user.id}
        destinatarioId={partnerId}
      />
    </div>
  );
}
