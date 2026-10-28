import current from '@/assets/data/sbc-refresh-20261028.json';
import latest from '@/assets/data/sbc-refresh-20261026.json';
import refresh from '@/assets/data/sbc-refresh-20261025.json';
import { sourceClassicRulesMatch, knownClassicRules } from '@/lib/sbcSourceRules';
import snapshot from '@/assets/data/sbc-classic-verified-20261021.json';
import { evaluateSquad, formationById, isFormationId } from '@/lib/chemistry';
import { PLAYERS } from '@/lib/fcPlayers';
import type { SquadRules } from '@/lib/types';
export type ClassicSegment = { name: string; rules: SquadRules; formation: string; squad?: Record<string, string>; activeSlots?: string[]; positionOverrides?: Record<string, string>; sourceUrl?: string; solutionUrl?: string; checkedAt?: string; provenance?: string; sourceRequirements?: string[] };
const players = new Map(PLAYERS.map((p) => [p.id, p]));
export function classicSegments(id: string): ClassicSegment[] {
  return ({ ...snapshot, ...refresh.classic, ...latest.classic, ...current.classic } as unknown as Record<string, { segments: ClassicSegment[] }>)[id]?.segments ?? [];
}
export function classicFormation(segment: ClassicSegment, formation = segment.formation) {
  const base = formationById(formation);
  if (formation !== segment.formation || !segment.positionOverrides) return base;
  return { ...base, lines: base.lines.map(line => line.map(slot => segment.positionOverrides?.[slot.id] ? { ...slot, position: segment.positionOverrides[slot.id] } : slot)) };
}
export function checkClassicSquad(segment: ClassicSegment, formation: string, squad: Record<string, string>) {
  const expected = classicFormation(segment, formation);
  const slots = new Set(expected.lines.flat().map((slot) => slot.id));
  const validSource = knownClassicRules(segment.rules) && (!segment.sourceRequirements || sourceClassicRulesMatch(segment.sourceRequirements, segment.rules));
  const validActiveSlots = !segment.activeSlots || (segment.activeSlots.length === (segment.rules.playerCount ?? 11) && new Set(segment.activeSlots).size === segment.activeSlots.length && segment.activeSlots.every((slot) => slots.has(slot)) && Object.keys(squad).every((slot) => segment.activeSlots!.includes(slot)));
  const validEntries = validSource && validActiveSlots && isFormationId(formation) && (!segment.rules.chemistry || formation === segment.formation) && Object.entries(squad).every(([slot, id]) => slots.has(slot) && players.has(id));
  const report = evaluateSquad(expected, Object.fromEntries(Object.entries(squad).map(([slot, id]) => [slot, players.get(id) ?? null])), segment.rules);
  return { ...report, ready: validEntries && report.ready };
}
export function communitySquadStatus(challengeId: string, formation: string | null | undefined, squad: Record<string, string> | null | undefined): 'checked' | 'invalid' | 'unverified' {
  const segments = classicSegments(challengeId);
  if (!squad || !formation || segments.length !== 1) return 'unverified';
  if (Object.values(squad).some((id) => players.get(id)?.edition || players.get(id)?.icon)) return 'unverified';
  return checkClassicSquad(segments[0], formation, squad).ready ? 'checked' : 'invalid';
}
