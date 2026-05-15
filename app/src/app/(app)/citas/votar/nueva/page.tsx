import { requireCoupleContext } from '@/lib/auth-helpers';
import { ManualProposalForm } from './form';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui';
import Link from 'next/link';

export const metadata = { title: 'Ohana · Crear propuesta manual' };
export const dynamic = 'force-dynamic';

export default async function NuevaPropuestaPage() {
  const { supabase, couple } = await requireCoupleContext();

  const { data: ideas } = await supabase
    .from('citas_ideas')
    .select('id, nombre_actividad')
    .eq('couple_id', couple.id)
    .eq('archivada', false)
    .order('nombre_actividad', { ascending: true });

  return (
    <div className="px-5 py-8 md:px-10 max-w-xl mx-auto">
      <PageHeader
        eyebrow="Propuesta manual"
        title="Pick 3"
        titleAccent="para esta semana"
        subtitle="Mientras Claude no genera propuestas automáticas (Phase 4), elige manualmente 3 ideas de la biblioteca."
      />

      {!ideas || ideas.length < 3 ? (
        <EmptyState
          title="Necesitas al menos 3 ideas en la biblioteca"
          description={`Tienes ${ideas?.length ?? 0}. Agrega más antes de crear una propuesta.`}
          action={
            <Link href="/citas/ideas/nueva">
              <Button variant="accent">+ Nueva idea</Button>
            </Link>
          }
        />
      ) : (
        <ManualProposalForm coupleId={couple.id} ideas={ideas} />
      )}
    </div>
  );
}
