'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Label } from '@/components/ui';

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const callbackUrl = new URL('/auth/callback', window.location.origin);
    if (redirectTo) callbackUrl.searchParams.set('next', redirectTo);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/login?sent=1');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Tu correo</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@correo.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>
      {error && (
        <p className="text-[13px] text-error font-medium">{error}</p>
      )}
      <Button variant="accent" className="w-full py-3.5" disabled={loading || !email}>
        {loading ? 'Enviando…' : 'Enviar magic link'}
      </Button>
      <p className="meta text-center mt-4">
        Al continuar aceptas los términos. Solo tu pareja verá lo que registres.
      </p>
    </form>
  );
}
