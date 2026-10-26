import { PLAYERS, type FcPlayer } from '@/lib/fcPlayers';

const affected = new Set(PLAYERS.filter(card => card.edition === 'recent').map(card => card.baseId ?? card.id));
const editionsByPerson = new Map<string, FcPlayer[]>();
for (const card of PLAYERS) {
  const person = card.baseId ?? card.id;
  if (!affected.has(person)) continue;
  const editions = editionsByPerson.get(person) ?? [];
  editions.push(card);
  editionsByPerson.set(person, editions);
}
const EMPTY_EDITIONS: readonly FcPlayer[] = [];
/** Exact catalogue rows for a person with a new release, including their original card. */
export function playerEditionsFor(card: FcPlayer): readonly FcPlayer[] {
  return editionsByPerson.get(card.baseId ?? card.id) ?? EMPTY_EDITIONS;
}
