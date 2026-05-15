import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

/**
 * Crea un usuario en Supabase Auth con una password temporal y vincula al couple.
 *
 * Flow:
 *  1. Verifica que el usuario actual sea miembro del couple
 *  2. Genera una password aleatoria (12 chars)
 *  3. Crea el auth user vía service role (admin)
 *  4. Crea/actualiza la invitation marcando must_change_password = true
 *  5. Vincula al couple
 *  6. Regresa la password al frontend para que la comparta con su pareja
 *
 * IMPORTANTE: La password generada solo se muestra al inviter una vez.
 * No se guarda en plaintext en ningún lado.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No auth' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== 'string' || typeof body.coupleId !== 'string') {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  // Verificar que el usuario actual pertenece al couple
  const { data: couple } = await supabase
    .from('couples')
    .select('id, user_a_id, user_b_id')
    .eq('id', body.coupleId)
    .single();

  if (!couple || (couple.user_a_id !== user.id && couple.user_b_id !== user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (couple.user_b_id) {
    return NextResponse.json({ error: 'Couple ya tiene partner' }, { status: 409 });
  }

  // Generar password
  const password = generatePassword();

  // Crear auth user con service role
  const admin = createServiceRoleClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: body.email,
    password,
    email_confirm: true,
    user_metadata: { invited_by: user.id, must_change_password: true },
  });

  if (createError || !created.user) {
    // El email puede ya existir, manejarlo
    return NextResponse.json(
      { error: createError?.message ?? 'No se pudo crear usuario' },
      { status: 400 }
    );
  }

  // Marcar al user nuevo con must_change_password = true
  await admin
    .from('users')
    .update({ must_change_password: true })
    .eq('id', created.user.id);

  // Bindear al couple (el trigger de Supabase puede tardar; lo aseguramos manual)
  await admin
    .from('couples')
    .update({ user_b_id: created.user.id })
    .eq('id', couple.id);

  // Registrar la invitation
  await admin.from('invitations').insert({
    couple_id: couple.id,
    invited_by: user.id,
    email: body.email,
    message: body.message ?? null,
    accepted_at: new Date().toISOString(),
    must_change_password: true,
  });

  return NextResponse.json({ password, email: body.email });
}

function generatePassword(): string {
  // 12 chars · letras minúsculas + números + un símbolo. Memorable, no super hostil.
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%&';
  const all = lower + digits + symbols;
  const arr: string[] = [];
  // Crypto random
  const bytes = new Uint8Array(12);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback (no debería pasar en Node 18+ runtime)
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < bytes.length; i++) {
    arr.push(all[bytes[i]! % all.length]!);
  }
  // Garantizar al menos 1 digit y 1 symbol
  arr[5] = digits[bytes[5]! % digits.length]!;
  arr[10] = symbols[bytes[10]! % symbols.length]!;
  return arr.join('');
}
