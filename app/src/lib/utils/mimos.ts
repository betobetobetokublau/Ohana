/**
 * Lógica de la sesión mensual de Mimos.
 *
 * El reveal alterna autores cuando es posible. Si hay desbalance
 * (3 míos / 7 de la pareja), el lado con menos "se estira" para que se
 * vean tan alternados como sea posible.
 */

export type AuthorIdentifiable = {
  autor_id: string;
};

/**
 * Ordena los mimos alternando entre autor y partner.
 *
 * Algoritmo:
 *  1. Separar mimos por autor (míos vs de pareja).
 *  2. Empezar por quien tenga menos (o equal → empezar por "míos").
 *  3. Alternar mientras ambos tienen mimos disponibles.
 *  4. Si uno se queda sin, los restantes se concatenan al final.
 *
 * Casos cubiertos:
 *  - Balance perfecto (3 + 3) → ABABAB
 *  - Desbalance (2 + 4) → BABABB (empieza el de menos)
 *  - All mine (3 + 0) → AAA
 *  - All theirs (0 + 3) → BBB
 *  - Vacío → []
 */
export function orderAlternating<T extends AuthorIdentifiable>(
  mimos: T[],
  myId: string,
  partnerId: string
): T[] {
  if (mimos.length === 0) return [];

  const mine = mimos.filter(m => m.autor_id === myId);
  const theirs = mimos.filter(m => m.autor_id === partnerId);

  const result: T[] = [];
  let i = 0;
  let j = 0;

  // Empezar por quien tenga menos (o "míos" si empate)
  let useMine = mine.length <= theirs.length;

  while (i < mine.length || j < theirs.length) {
    if (useMine && i < mine.length) {
      result.push(mine[i]!);
      i++;
    } else if (!useMine && j < theirs.length) {
      result.push(theirs[j]!);
      j++;
    } else if (i < mine.length) {
      // Mine exhausted? No, theirs exhausted. Push mine.
      result.push(mine[i]!);
      i++;
    } else if (j < theirs.length) {
      result.push(theirs[j]!);
      j++;
    }
    useMine = !useMine;
  }

  return result;
}
