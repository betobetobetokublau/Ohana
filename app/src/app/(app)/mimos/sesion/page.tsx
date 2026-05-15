import { requireCoupleContext } from '@/lib/auth-helpers';
import { MimosSession } from './session';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui';
import Link from 'next/link';
import type { MimoEmocion } from '@/lib/types';

export const metadata = { title: 'Ohana · Sesión Mimos' };
export const dynamic = 'force-dynamic';

type Mimo = {
  id: string;
  autor_id: string;
  titulo: string;
  descripcion: string | null;
  emocion_asociada: MimoEmocion | null;
  created_at: string;
};

export default async function MimosSesionPage() {
  const { supabase, user, couple, partnerId } = await requireCoupleContext();

  // Mimos no revelados aún (de ambos)
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: mimos } = await supabase
    .from('mimos')
    .select('id, autor_id, titulo, descripcion, emocion_asociada, created_at')
    .eq('couple_id', couple.id)
    .is('revealed_in_session_id', null)
    .gte('created_at', firstOfMonth)
    .order('created_at', { ascending: true })
    .returns<Mimo[]>();

  if (!mimos || mimos.length === 0) {
    return (
      <div className="px-5 py-8 md:px-10 max-w-2xl mx-auto">
        <PageHeader
          eyebrow="Sesión Mimos"
          title="Sin mimos"
          titleAccent="este mes"
          subtitle="Necesitan mimos acumulados antes de poder hacer la sesión."
        />
        <EmptyState
          title="Comienza el ritual"
          description="Cada uno agrega los mimos que quiera durante el mes. El primer domingo del próximo mes los revelan juntos."
          action={
            <Link href="/mimos/nuevo">
              <Button variant="accent">Agregar primer mimo</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="px-5 py-8 md:px-10 max-w-3xl mx-auto">
      <PageHeader
        eyebrow="Sesión Mimos · ritual mensual"
        title="Lo que se"
        titleAccent="acumuló"
        subtitle="Un mimo a la vez, alternando autores. Sin prisa."
      />

      <MimosSession
        coupleId={couple.id}
        mimos={mimos}
        myId={user.id}
        partnerId={partnerId ?? ''}
      />
    </div>
  );
}
