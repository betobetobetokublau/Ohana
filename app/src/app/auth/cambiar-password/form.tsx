'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Label } from '@/components/ui';

export function ChangePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError('Mínimo 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las passwords no coinciden.');
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();

    // Update auth password
    const { error: authError } = await supabase.auth.updateUser({ password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Quitar el flag must_change_password
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('users').update({ must_change_password: false }).eq('id', user.id);
    }

    router.push('/hoy');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="pw">Nueva password</Label>
        <Input
          id="pw"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="confirm">Confirmar password</Label>
        <Input
          id="confirm"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Repítela"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
        />
      </div>
      {error && <p className="text-[13px] text-error font-medium">{error}</p>}
      <Button variant="accent" className="w-full py-3.5" disabled={loading || !password || !confirm}>
        {loading ? 'Guardando…' : 'Cambiar password y continuar'}
      </Button>
    </form>
  );
}
