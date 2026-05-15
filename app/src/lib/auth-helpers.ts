import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { partnerOf, isUserA } from '@/lib/utils/partner';

/**
 * Helper centralizado · obtiene user + couple, redirige si falta cualquiera.
 * Todas las páginas dentro de (app)/ deberían usar esto en lugar de duplicar la lógica.
 *
 * Expone también helpers derivados:
 *  - partnerId · el otro usuario del couple, null si solo (pre-invite)
 *  - isUserA · si el usuario actual es user_a (importante para columnas _a/_b)
 */
export async function requireCoupleContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: couple } = await supabase
    .from('couples')
    .select('id, display_name, user_a_id, user_b_id, anniversary_date')
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .maybeSingle();

  if (!couple) redirect('/onboarding/espacio');

  return {
    supabase,
    user,
    couple,
    partnerId: partnerOf(couple, user.id),
    isUserA: isUserA(couple, user.id),
  };
}
