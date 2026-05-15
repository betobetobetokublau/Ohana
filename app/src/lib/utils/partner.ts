/**
 * Helpers puros para razonar sobre couple/partner sin tocar la base.
 * Permiten probar la lógica sin mock de Supabase.
 */

export type CouplePair = {
  user_a_id: string;
  user_b_id: string | null;
};

/**
 * Regresa el id del partner del usuario dado, o null si no hay pareja completa
 * o si el usuario no pertenece al couple.
 */
export function partnerOf(couple: CouplePair, userId: string): string | null {
  if (couple.user_a_id === userId) return couple.user_b_id;
  if (couple.user_b_id === userId) return couple.user_a_id;
  return null;
}

/**
 * Detecta si el usuario es user_a del couple.
 * Usado para resolver qué columnas leer/escribir en queries con sufijo _a/_b
 * (calificaciones, partner-ratings, interés en wishlist).
 */
export function isUserA(couple: CouplePair, userId: string): boolean {
  return couple.user_a_id === userId;
}
