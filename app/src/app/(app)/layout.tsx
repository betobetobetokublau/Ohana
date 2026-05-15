import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/shell/app-shell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: couple } = await supabase
    .from('couples')
    .select('id, display_name, user_a_id, user_b_id')
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .maybeSingle();

  if (!couple) redirect('/onboarding/espacio');

  const { data: userRow } = await supabase
    .from('users')
    .select('display_name, avatar_emoji, avatar_color')
    .eq('id', user.id)
    .single();

  const { count: unread } = await supabase
    .from('notification_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null);

  return (
    <AppShell
      coupleName={couple.display_name}
      avatar={{ emoji: userRow?.avatar_emoji, color: userRow?.avatar_color }}
      unreadCount={unread ?? 0}
    >
      {children}
    </AppShell>
  );
}
