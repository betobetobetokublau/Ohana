'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Label, Textarea } from '@/components/ui';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

type Mode = 'magic-link' | 'password';

export function InvitePartnerForm({ coupleId, userId }: { coupleId: string; userId: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('magic-link');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === 'magic-link') {
      const supabase = createClient();

      const { error: inviteError } = await supabase.from('invitations').insert({
        couple_id: coupleId,
        invited_by: userId,
        email,
        message: message || null,
      });

      if (inviteError) {
        setError(inviteError.message);
        setLoading(false);
        return;
      }

      const callbackUrl = new URL('/auth/callback', window.location.origin);
      callbackUrl.searchParams.set('next', '/hoy');

      await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: callbackUrl.toString() },
      });

      setSent(true);
      setLoading(false);
    } else {
      // password mode · API server-side
      const res = await fetch('/api/invite-with-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, coupleId, message: message || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Error al crear cuenta');
        setLoading(false);
        return;
      }
      setTempPassword(data.password);
      setSent(true);
      setLoading(false);
    }
  }

  if (sent && mode === 'password' && tempPassword) {
    return (
      <div className="space-y-4">
        <div className="card-warm">
          <div className="eyebrow text-accent-deep mb-2">Cuenta creada · password temporal</div>
          <p className="text-[14px] mb-3">
            Comparte estas credenciales con tu pareja. Al iniciar sesión por primera vez,
            se le pedirá cambiar la password.
          </p>
          <div className="bg-bg border border-line rounded-md p-3 font-mono space-y-2 text-[14px]">
            <div><span className="meta">Email:</span> <strong>{email}</strong></div>
            <div className="flex items-center justify-between gap-2">
              <span><span className="meta">Password:</span> <strong>{tempPassword}</strong></span>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => navigator.clipboard.writeText(tempPassword)}
              >
                Copiar
              </Button>
            </div>
          </div>
          <p className="meta mt-3">
            Esta password solo se muestra una vez. Si la pierdes, tendrás que reinviar.
          </p>
        </div>
        <Link href="/hoy">
          <Button variant="primary" className="w-full py-3.5">Entrar a Ohana</Button>
        </Link>
      </div>
    );
  }

  if (sent && mode === 'magic-link') {
    return (
      <div className="space-y-4">
        <div className="card-warm text-center">
          <p className="font-serif italic text-[15px] text-accent-deep">
            Invitación enviada a {email}.
          </p>
          <p className="meta mt-2">Expira en 14 días.</p>
        </div>
        <Link href="/hoy">
          <Button variant="primary" className="w-full py-3.5">Entrar a Ohana</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Mode picker */}
      <div className="flex gap-2 p-1 bg-surface rounded-md border border-line">
        <ModeTab active={mode === 'magic-link'} onClick={() => setMode('magic-link')}>
          Magic link
        </ModeTab>
        <ModeTab active={mode === 'password'} onClick={() => setMode('password')}>
          Password temporal
        </ModeTab>
      </div>

      <p className="meta">
        {mode === 'magic-link'
          ? 'Le mandamos un link al correo. Click → cuenta lista.'
          : 'Generamos una password temporal. Tú se la pasas. Cambia su password al primer login.'}
      </p>

      <div>
        <Label htmlFor="email">Email de tu pareja</Label>
        <Input
          id="email"
          type="email"
          required
          placeholder="sofia@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="message">Mensaje (opcional)</Label>
        <Textarea
          id="message"
          rows={3}
          placeholder="Mi amor, te metí a una app que se me hace bonita…"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
      </div>
      {error && <p className="text-[13px] text-error font-medium">{error}</p>}
      <Button variant="accent" className="w-full py-3.5" disabled={loading || !email}>
        {loading
          ? 'Procesando…'
          : mode === 'magic-link'
            ? 'Enviar magic link'
            : 'Crear cuenta con password temporal'}
      </Button>
      <Link href="/hoy" className="block text-center">
        <button type="button" className="text-[14px] font-medium text-accent underline underline-offset-4">
          Hacer esto después
        </button>
      </Link>
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
