/**
 * Lógica core del módulo Citas.
 * El reveal del PRD §6.1.3: detectar overlap entre votos.
 */

/**
 * Detecta consenso en la votación semanal · una idea que ambos votaron.
 *
 * Reglas (PRD §6.1.3):
 *  - "Consensus" = al menos una idea aparece en ambos sets de votos
 *  - Si hay múltiples overlaps, regresa el primero del orden de myVotes
 *  - Si no hay overlap, regresa null
 *
 * @param myVotes IDs votados por el usuario actual
 * @param partnerVotes IDs votados por la pareja
 * @returns ID de la idea consensuada, o null si no hay overlap
 */
export function detectConsensus(myVotes: string[], partnerVotes: string[]): string | null {
  if (myVotes.length === 0 || partnerVotes.length === 0) return null;
  const partnerSet = new Set(partnerVotes);
  return myVotes.find(id => partnerSet.has(id)) ?? null;
}

/**
 * Indica si ambos partners ya votaron (ambos sets tienen al menos un elemento).
 */
export function bothHaveVoted(myVotes: string[], partnerVotes: string[]): boolean {
  return myVotes.length > 0 && partnerVotes.length > 0;
}
