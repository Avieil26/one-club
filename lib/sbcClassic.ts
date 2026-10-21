import snapshot from '@/assets/data/sbc-classic-verified-20261021.json';
import { evaluateSquad, formationById, isFormationId } from '@/lib/chemistry';
import { PLAYERS } from '@/lib/fcPlayers';
import type { SquadRules } from '@/lib/types';
export type ClassicSegment = { name: string; rules: SquadRules; formation: string; squad?: Record<string, string> };
const players = new Map(PLAYERS.map((p) => [p.id, p]));
export function classicSegments(id: string): ClassicSegment[] {
  return (snapshot as unknown as Record<string, { segments: ClassicSegment[] }>)[id]?.segments ?? [];
}
export function checkClassicSquad(segment: ClassicSegment, formation: string, squad: Record<string, string>) {
  const expected = formationById(formation);
  const slots = new Set(expected.lines.flat().map((slot) => slot.id));
  const validEntries = isFormationId(formation) && (!segment.rules.chemistry || formation === segment.formation) && Object.entries(squad).every(([slot, id]) => slots.has(slot) && players.has(id));
  const report = evaluateSquad(expected, Object.fromEntries(Object.entries(squad).map(([slot, id]) => [slot, players.get(id) ?? null])), segment.rules);
  return { ...report, ready: validEntries && report.ready };
}
export function communitySquadStatus(challengeId: string, formation: string | null | undefined, squad: Record<string, string> | null | undefined): 'checked' | 'invalid' | 'unverified' {
  const segments = classicSegments(challengeId);
  if (!squad || !formation || segments.length !== 1) return 'unverified';
  if (Object.values(squad).some((id) => players.get(id)?.edition || players.get(id)?.icon)) return 'unverified';
  return checkClassicSquad(segments[0], formation, squad).ready ? 'checked' : 'invalid';
}
