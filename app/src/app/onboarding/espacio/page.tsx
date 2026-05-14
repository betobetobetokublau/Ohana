import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CreateSpaceForm } from './form';

export const metadata = { title: 'Ohana · crea tu espacio' };

export default async function EspacioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Si ya tiene couple, brincarlo
  const { data: couple } = await supabase
    .from('couples')
    .select('id')
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .maybeSingle();

  if (couple) redirect('/onboarding/invitar');

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-bg">
      <div className="w-full max-w-md">
        <div className="eyebrow text-accent mb-2">Paso 2 de 3 · espacio compartido</div>
        <h1 className="display text-3xl">
          ¿Cómo se llama <em>su espacio</em>?
        </h1>
        <p className="italic-serif text-[15px] mt-3 mb-8">
          Solo lo verán ustedes dos. Pueden cambiarlo después.
        </p>
        <CreateSpaceForm userId={user.id} />
      </div>
    </main>
  );
}
