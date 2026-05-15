import { requireCoupleContext } from '@/lib/auth-helpers';
import { NewDiscusionForm } from './form';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Ohana · Nueva discusión' };
export const dynamic = 'force-dynamic';

export default async function NuevaDiscusionPage() {
  const { supabase, couple, user } = await requireCoupleContext();

  const { data: temas } = await supabase
    .from('temas')
    .select('id, nombre_tema')
    .eq('couple_id', couple.id)
    .neq('estado', 'archivado')
    .order('created_at', { ascending: false });

  return (
    <div className="px-5 py-8 md:px-10 max-w-xl mx-auto">
      <PageHeader
        eyebrow="Nueva discusión"
        title="Documenta el"
        titleAccent="desencuentro"
        subtitle="Resumen breve. El contexto que lo destapó. La lección que sacaron. No es asignar culpa."
      />
      <NewDiscusionForm coupleId={couple.id} userId={user.id} temas={temas ?? []} />
    </div>
  );
}
