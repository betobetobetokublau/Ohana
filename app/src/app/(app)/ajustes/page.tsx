import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, Button } from '@/components/ui';

export const metadata = { title: 'Ohana · Ajustes' };
export const dynamic = 'force-dynamic';

export default async function AjustesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('display_name, email')
    .eq('id', user.id)
    .single();

  const { data: couple } = await supabase
    .from('couples')
    .select('display_name, anniversary_date, user_b_id')
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .single();

  return (
    <div className="px-5 py-8 md:px-10 max-w-2xl mx-auto">
      <div className="eyebrow mb-2">Ajustes</div>
      <h1 className="display text-3xl"><em>Tu</em> cuenta.</h1>
      <p className="italic-serif text-[15px] mt-2 mb-7">
        Lo que es tuyo, lo que es del espacio compartido.
      </p>

      <div className="space-y-3">
        <Card>
          <div className="eyebrow mb-2">Perfil</div>
          <div className="text-[14px] font-medium">{profile?.display_name || '—'}</div>
          <div className="meta">{profile?.email}</div>
        </Card>

        <Card>
          <div className="eyebrow mb-2">Espacio compartido</div>
          <div className="text-[14px] font-medium">{couple?.display_name}</div>
          <div className="meta">
            Aniversario: {couple?.anniversary_date || '—'}
          </div>
          {!couple?.user_b_id && (
            <p className="italic-serif text-[13px] mt-3 text-accent-deep">
              Tu pareja aún no se ha unido. Las invitaciones expiran en 14 días.
            </p>
          )}
        </Card>

        <Card>
          <div className="eyebrow mb-2">Sesión</div>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost" size="sm">
              Cerrar sesión
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
