import { FORMATIONS, isFormationId, type FormationId } from '@/lib/chemistry';
import { PLAYERS } from '@/lib/fcPlayers';

const MARK = 'SBC1';
const SQUAD_IMAGE = 'squad';

export function isSquadImage(uri: string): boolean {
  return uri === SQUAD_IMAGE;
}

export function solutionImages(uris: string[]): string[] {
  return uris.filter((uri) => uri && !isSquadImage(uri)).slice(0, 3);
}

export type EncodedSquad = {
  formation: FormationId;
  slots: Record<string, string>;
};

function formationSlots(formation: FormationId): string[] {
  const found = FORMATIONS.find((item) => item.id === formation) ?? FORMATIONS[0];
  return found.lines.flatMap((line) => line.map((slot) => slot.id));
}

/** A full 11, or null when the publisher sent a screenshot instead. */
export function readSquad(
  slots: Record<string, string> | null | undefined,
  formation: string | null | undefined,
): EncodedSquad | null {
  if (!slots && !formation) return null;
  if (!formation || !isFormationId(formation)) throw new Error('צריך לבחור מערך לסגל');
  const clean: Record<string, string> = {};
  const seen = new Set<string>();
  for (const slot of formationSlots(formation)) {
    const id = slots?.[slot]?.trim();
    if (!id || !PLAYERS.some((player) => player.id === id)) throw new Error('הסגל חסר שחקן מהרשימה');
    if (seen.has(id)) throw new Error('אי אפשר לשים את אותו שחקן פעמיים');
    seen.add(id);
    clean[slot] = id;
  }
  return { formation, slots: clean };
}

/** Stored in the explanation column so a squad survives without a new database field. */
export function encodeSolution(explanation: string, squad: EncodedSquad | null): string {
  if (!squad) return explanation;
  const pairs = Object.entries(squad.slots)
    .map(([slot, id]) => `${slot}=${id}`)
    .join('|');
  return `${MARK} ${squad.formation} ${pairs}\n${explanation}`;
}

export function decodeSolution(stored: string): { explanation: string; squad: EncodedSquad | null } {
  if (!stored.startsWith(`${MARK} `)) return { explanation: stored, squad: null };
  const breakAt = stored.indexOf('\n');
  const head = breakAt < 0 ? stored : stored.slice(0, breakAt);
  const body = breakAt < 0 ? '' : stored.slice(breakAt + 1);
  const parts = head.split(' ');
  const formation = parts[1];
  const pairs = parts[2];
  if (!isFormationId(formation) || !pairs) return { explanation: stored, squad: null };
  const slots: Record<string, string> = {};
  for (const pair of pairs.split('|')) {
    const eq = pair.indexOf('=');
    if (eq <= 0) continue;
    slots[pair.slice(0, eq)] = pair.slice(eq + 1);
  }
  if (Object.keys(slots).length !== 11) return { explanation: stored, squad: null };
  return { explanation: body, squad: { formation, slots } };
}

export function proofImages(uris: string[], squad: EncodedSquad | null): string[] {
  const shots = solutionImages(uris);
  if (shots.length) return shots;
  if (squad) return [SQUAD_IMAGE];
  return [];
}
