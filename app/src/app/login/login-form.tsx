'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Label } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

type Mode = 'magic-link' | 'password';

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('magic-link');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    if (mode === 'magic-link') {
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      if (redirectTo) callbackUrl.searchParams.set('next', redirectTo);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: callbackUrl.toString() },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      router.push('/login?sent=1');
      return;
    }

    // password mode
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setError(error?.message ?? 'Credenciales inválidas');
      setLoading(false);
      return;
    }

    // Check must_change_password flag en public.users
    const { data: userRow } = await supabase
      .from('users')
      .select('must_change_password')
      .eq('id', data.user.id)
      .single();

    if (userRow?.must_change_password) {
      router.push('/auth/cambiar-password');
      return;
    }

    router.push(redirectTo ?? '/hoy');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mode picker */}
      <div className="flex gap-2 p-1 bg-surface rounded-md border border-line mb-3">
        <ModeTab active={mode === 'magic-link'} onClick={() => setMode('magic-link')}>
          Magic link
        </ModeTab>
        <ModeTab active={mode === 'password'} onClick={() => setMode('password')}>
          Email + password
        </ModeTab>
      </div>

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

      {mode === 'password' && (
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Tu password (o la temporal que te dieron)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
      )}

      {error && (
        <p className="text-[13px] text-error font-medium">{error}</p>
      )}
      <Button variant="accent" className="w-full py-3.5" disabled={loading || !email || (mode === 'password' && !password)}>
        {loading
          ? 'Enviando…'
          : mode === 'magic-link'
            ? 'Enviar magic link'
            : 'Iniciar sesión'}
      </Button>
      <p className="meta text-center mt-4">
        Al continuar aceptas los términos. Solo tu pareja verá lo que registres.
      </p>
    </form>
  );
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 py-2 px-3 rounded-sm text-[12px] font-semibold uppercase tracking-wider transition-colors',
        active ? 'bg-ink text-bg' : 'text-muted hover:text-ink'
      )}
    >
      {children}
    </button>
  );
}
