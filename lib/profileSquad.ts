import { FORMATIONS, isFormationId } from '@/lib/chemistry';
import { PLAYERS, type FcPlayer } from '@/lib/fcPlayers';
import type { ProfileSquad } from '@/lib/types';

const BY_ID = new Map(PLAYERS.map((player) => [player.id, player]));

export function playerById(id: string): FcPlayer | null {
  return BY_ID.get(id) ?? null;
}

export function formationById(id: string | null | undefined) {
  return FORMATIONS.find((formation) => formation.id === id) ?? FORMATIONS[0];
}

export function normalizeSquad(raw: unknown): ProfileSquad | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as { formation?: unknown; slots?: unknown; bench?: unknown };
  if (typeof value.formation !== 'string' || !isFormationId(value.formation)) return null;
  const allowed = new Set(formationById(value.formation).lines.flat().map((slot) => slot.id));
  const slots: Record<string, string> = {};
  const used = new Set<string>();
  if (value.slots && typeof value.slots === 'object') {
    for (const [slotId, playerId] of Object.entries(value.slots as Record<string, unknown>)) {
      if (!allowed.has(slotId) || typeof playerId !== 'string') continue;
      if (!BY_ID.has(playerId) || used.has(playerId)) continue;
      slots[slotId] = playerId;
      used.add(playerId);
    }
  }
  const bench: string[] = [];
  if (Array.isArray(value.bench)) {
    for (const playerId of value.bench) {
      if (bench.length >= 7) break;
      if (typeof playerId !== 'string' || !BY_ID.has(playerId) || used.has(playerId)) continue;
      bench.push(playerId);
      used.add(playerId);
    }
  }
  if (!Object.keys(slots).length && !bench.length) return null;
  return { formation: value.formation, slots, bench };
}

export function placedFromSquad(squad: ProfileSquad): Record<string, FcPlayer | null> {
  const placed: Record<string, FcPlayer | null> = {};
  for (const slot of formationById(squad.formation).lines.flat()) {
    const id = squad.slots[slot.id];
    placed[slot.id] = id ? (BY_ID.get(id) ?? null) : null;
  }
  return placed;
}
