'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Label } from '@/components/ui';

export function CreateSpaceForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error: insertError } = await supabase
      .from('couples')
      .insert({
        display_name: displayName,
        user_a_id: userId,
        anniversary_date: anniversary || null,
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push('/onboarding/invitar');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="displayName">Nombre del espacio</Label>
        <Input
          id="displayName"
          required
          placeholder="Alberto y Sofía"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="anniversary">Aniversario (opcional)</Label>
        <Input
          id="anniversary"
          type="date"
          value={anniversary}
          onChange={e => setAnniversary(e.target.value)}
        />
      </div>
      {error && <p className="text-[13px] text-error font-medium">{error}</p>}
      <Button variant="accent" className="w-full py-3.5" disabled={loading || !displayName}>
        {loading ? 'Creando…' : 'Continuar'}
      </Button>
    </form>
  );
}
