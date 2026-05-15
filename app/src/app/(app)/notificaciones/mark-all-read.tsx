'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui';

export function MarkAllReadButton({ userId, unreadCount }: { userId: string; unreadCount: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (unreadCount === 0) return null;

  async function markAll() {
    const supabase = createClient();
    await supabase
      .from('notification_events')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);
    startTransition(() => router.refresh());
  }

  return (
    <Button variant="ghost" size="sm" onClick={markAll} disabled={pending}>
      {pending ? 'Marcando…' : 'Marcar todas leídas'}
    </Button>
  );
}
