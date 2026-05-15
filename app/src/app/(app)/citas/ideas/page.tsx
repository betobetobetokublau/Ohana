import Link from 'next/link';
import { requireCoupleContext } from '@/lib/auth-helpers';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button, Card, Pill } from '@/components/ui';

export const metadata = { title: 'Ohana · Biblioteca de citas' };
export const dynamic = 'force-dynamic';

type Idea = {
  id: string;
  nombre_actividad: string;
  duracion: { value: number; unit: 'horas' | 'dias' } | null;
  complejidad: 'baja' | 'media' | 'alta' | null;
  presupuesto: number | null;
  usuario_que_prefiere_id: string | null;
  archivada: boolean;
};

export default async function IdeasPage() {
  const { supabase, couple } = await requireCoupleContext();

  const { data: ideas } = await supabase
    .from('citas_ideas')
    .select('id, nombre_actividad, duracion, complejidad, presupuesto, usuario_que_prefiere_id, archivada')
    .eq('couple_id', couple.id)
    .eq('archivada', false)
    .order('nombre_actividad', { ascending: true })
    .returns<Idea[]>();

  return (
    <div className="px-5 py-8 md:px-10 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Biblioteca de citas"
        title="Lo que quieren"
        titleAccent="alguna vez"
        subtitle="Ideas que cualquiera de los dos quiere hacer. Crece con el tiempo."
        actions={
          <Link href="/citas/ideas/nueva">
            <Button variant="accent" size="sm">+ Nueva idea</Button>
          </Link>
        }
      />

      {!ideas || ideas.length === 0 ? (
        <EmptyState
          title="Aún no tienen ideas"
          description="Empieza por anotar una idea que cualquiera de los dos haya tenido alguna vez."
          action={
            <Link href="/citas/ideas/nueva">
              <Button variant="accent">Agregar primera idea</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {ideas.map(idea => (
            <Card key={idea.id}>
              <div className="font-serif text-lg leading-tight">
                {idea.nombre_actividad}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {idea.duracion && (
                  <Pill>
                    {idea.duracion.value} {idea.duracion.unit}
                  </Pill>
                )}
                {idea.complejidad && <Pill>{idea.complejidad}</Pill>}
                {idea.presupuesto && (
                  <Pill>${idea.presupuesto.toLocaleString()} MXN</Pill>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
