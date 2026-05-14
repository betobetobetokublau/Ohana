import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { InvitePartnerForm } from './form';

export const metadata = { title: 'Ohana · invita a tu pareja' };

export default async function InvitarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: couple } = await supabase
    .from('couples')
    .select('id, display_name, user_b_id')
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .maybeSingle();

  if (!couple) redirect('/onboarding/espacio');
  if (couple.user_b_id) redirect('/hoy'); // ya hay pareja completa

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-bg">
      <div className="w-full max-w-md">
        <div className="eyebrow text-accent mb-2">Paso 3 de 3 · invita</div>
        <h1 className="display text-3xl">
          Tu pareja entra <em>aquí</em>.
        </h1>
        <p className="italic-serif text-[15px] mt-3 mb-8">
          Le mandamos un magic link al correo. Cuando entre, los dos verán todo lo
          que registren a partir de ese momento.
        </p>
        <InvitePartnerForm coupleId={couple.id} userId={user.id} />
      </div>
    </main>
  );
}
