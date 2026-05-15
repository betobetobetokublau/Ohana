import { requireCoupleContext } from '@/lib/auth-helpers';
import { ClaudeChat } from './chat';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Ohana · Pregúntale a Claude' };
export const dynamic = 'force-dynamic';

export default async function PreguntaleAClaudePage() {
  const { supabase, couple, user } = await requireCoupleContext();

  const { data: acuerdos } = await supabase
    .from('acuerdos')
    .select('id, nombre, descripcion, categoria')
    .eq('couple_id', couple.id)
    .order('created_at', { ascending: false });

  return (
    <div className="px-5 py-8 md:px-10 max-w-3xl mx-auto">
      <PageHeader
        eyebrow="Pregúntale a Claude"
        title="Pregunta antes"
        titleAccent="de hacer"
        subtitle="Claude lee sus acuerdos y te dice si un escenario hipotético cruza alguno. Las preguntas son privadas — tu pareja no las ve."
      />

      <ClaudeChat
        coupleId={couple.id}
        userId={user.id}
        acuerdosCount={acuerdos?.length ?? 0}
      />
    </div>
  );
}
