'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Label, Textarea } from '@/components/ui';
import Link from 'next/link';

export function InvitePartnerForm({ coupleId, userId }: { coupleId: string; userId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    // 1. Crear invitación
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

    // 2. Enviar magic link al email del invitado.
    //    El trigger bind_invitation_on_signup auto-bindea cuando se crea su user.
    const callbackUrl = new URL('/auth/callback', window.location.origin);
    callbackUrl.searchParams.set('next', '/hoy');

    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl.toString() },
    });

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <div className="card-warm text-center">
          <p className="font-serif italic text-[15px] text-accent-deep">
            Invitación enviada a {email}.
          </p>
          <p className="meta mt-2">Expira en 14 días.</p>
        </div>
        <Link href="/hoy" className="block">
          <Button variant="primary" className="w-full py-3.5">
            Entrar a Ohana
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
        {loading ? 'Enviando…' : 'Enviar invitación'}
      </Button>
      <Link href="/hoy" className="block text-center">
        <button type="button" className="text-[14px] font-medium text-accent underline underline-offset-4">
          Hacer esto después
        </button>
      </Link>
    </form>
  );
}
