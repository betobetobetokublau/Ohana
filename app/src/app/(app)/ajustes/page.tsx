import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, Button } from '@/components/ui';
import { AvatarPicker } from '@/components/shared/avatar-picker';
import { PageHeader } from '@/components/shared/page-header';

export const metadata = { title: 'Ohana · Ajustes' };
export const dynamic = 'force-dynamic';

export default async function AjustesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('display_name, email, avatar_emoji, avatar_color')
    .eq('id', user.id)
    .single();

  const { data: couple } = await supabase
    .from('couples')
    .select('display_name, anniversary_date, user_b_id')
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .single();

  return (
    <div className="px-5 py-8 md:px-10 max-w-2xl mx-auto">
      <PageHeader
        eyebrow="Ajustes"
        title="Tu"
        titleAccent="cuenta"
        subtitle="Personaliza cómo apareces ante tu pareja."
      />

      <div className="space-y-3">
        <Card className="p-6">
          <AvatarPicker
            userId={user.id}
            initialEmoji={profile?.avatar_emoji ?? null}
            initialColor={profile?.avatar_color ?? null}
          />
        </Card>

        <Card>
          <div className="eyebrow mb-2">Perfil</div>
          <div className="text-[14px] font-medium">{profile?.display_name ?? '—'}</div>
          <div className="meta">{profile?.email}</div>
        </Card>

        <Card>
          <div className="eyebrow mb-2">Espacio compartido</div>
          <div className="text-[14px] font-medium">{couple?.display_name}</div>
          <div className="meta">Aniversario: {couple?.anniversary_date ?? '—'}</div>
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
