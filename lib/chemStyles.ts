import type { MetaAttr } from '@/lib/playerMeta';

export type ChemBoosts = Partial<Record<MetaAttr, number>>;

export type ChemStyle = {
  id: string;
  name: string;
  tint: string;
  boosts: ChemBoosts;
};

/** Full-chemistry (3 diamonds) attribute boosts from EA FC 26. */
export const CHEM_STYLES: ChemStyle[] = [
  { id: 'basic', name: 'Basic', tint: '#D5DDE6', boosts: { sprintSpeed: 3, positioning: 3, shotPower: 3, penalties: 3, shortPassing: 3, longPassing: 3, curve: 3, agility: 3, ballControl: 3, dribbling: 3, composure: 3, defensiveAwareness: 3, standingTackle: 3, slidingTackle: 3, strength: 3 } },
  { id: 'hunter', name: 'Hunter', tint: '#E15B64', boosts: { acceleration: 6, sprintSpeed: 6, positioning: 3, finishing: 3, shotPower: 3, volleys: 9, penalties: 6 } },
  { id: 'shadow', name: 'Shadow', tint: '#8B7CFF', boosts: { acceleration: 6, sprintSpeed: 6, interceptions: 3, headingAccuracy: 6, defensiveAwareness: 3, standingTackle: 3, slidingTackle: 9 } },
  { id: 'catalyst', name: 'Catalyst', tint: '#3DDC97', boosts: { acceleration: 6, sprintSpeed: 6, vision: 9, crossing: 6, shortPassing: 3, longPassing: 6, curve: 3 } },
  { id: 'engine', name: 'Engine', tint: '#4CC3E0', boosts: { acceleration: 3, sprintSpeed: 3, vision: 3, crossing: 6, shortPassing: 3, longPassing: 3, curve: 6, agility: 3, balance: 6, dribbling: 6 } },
  { id: 'anchor', name: 'Anchor', tint: '#6EA8FF', boosts: { acceleration: 3, sprintSpeed: 3, interceptions: 3, headingAccuracy: 3, defensiveAwareness: 3, standingTackle: 6, slidingTackle: 6, jumping: 6, strength: 6, aggression: 3 } },
  { id: 'hawk', name: 'Hawk', tint: '#E3B341', boosts: { acceleration: 3, sprintSpeed: 3, positioning: 3, finishing: 3, shotPower: 6, longShots: 6, penalties: 3, jumping: 6, strength: 3, aggression: 6 } },
  { id: 'finisher', name: 'Finisher', tint: '#F08A5D', boosts: { positioning: 6, finishing: 9, shotPower: 3, longShots: 6, volleys: 3, penalties: 3, agility: 6, balance: 3, reactions: 3, dribbling: 9 } },
  { id: 'sniper', name: 'Sniper', tint: '#E36B8A', boosts: { positioning: 9, finishing: 3, shotPower: 3, longShots: 6, volleys: 3, penalties: 3, stamina: 6, strength: 9, aggression: 3 } },
  { id: 'deadeye', name: 'Deadeye', tint: '#7DDE8A', boosts: { positioning: 6, finishing: 3, shotPower: 9, longShots: 3, penalties: 3, vision: 3, shortPassing: 9, longPassing: 3, curve: 6 } },
  { id: 'marksman', name: 'Marksman', tint: '#C6A15B', boosts: { finishing: 6, shotPower: 3, longShots: 6, penalties: 3, reactions: 6, ballControl: 6, dribbling: 3, composure: 3, jumping: 3, strength: 6 } },
  { id: 'artist', name: 'Artist', tint: '#D58CFF', boosts: { vision: 3, crossing: 6, shortPassing: 3, longPassing: 6, curve: 9, agility: 9, reactions: 6, dribbling: 3, composure: 3 } },
  { id: 'architect', name: 'Architect', tint: '#9AA7FF', boosts: { vision: 6, freeKickAccuracy: 3, shortPassing: 9, longPassing: 3, curve: 6, stamina: 6, strength: 9, aggression: 3 } },
  { id: 'powerhouse', name: 'Powerhouse', tint: '#5B8DEF', boosts: { vision: 9, shortPassing: 6, longPassing: 6, curve: 3, interceptions: 6, defensiveAwareness: 3, standingTackle: 9, slidingTackle: 3 } },
  { id: 'maestro', name: 'Maestro', tint: '#E0C36A', boosts: { positioning: 3, shotPower: 3, longShots: 6, vision: 3, freeKickAccuracy: 6, shortPassing: 3, longPassing: 6, reactions: 3, ballControl: 6, dribbling: 3, composure: 3 } },
  { id: 'sentinel', name: 'Sentinel', tint: '#4F8FBF', boosts: { interceptions: 6, headingAccuracy: 6, defensiveAwareness: 9, standingTackle: 3, slidingTackle: 3, jumping: 9, strength: 3, aggression: 6 } },
  { id: 'guardian', name: 'Guardian', tint: '#3EBEB0', boosts: { agility: 6, reactions: 3, ballControl: 3, dribbling: 6, composure: 3, interceptions: 3, defensiveAwareness: 6, standingTackle: 9, slidingTackle: 6 } },
  { id: 'gladiator', name: 'Gladiator', tint: '#C47B4A', boosts: { positioning: 3, shotPower: 6, longShots: 3, balance: 3, reactions: 6, ballControl: 3, dribbling: 3, interceptions: 3, headingAccuracy: 3, defensiveAwareness: 3, standingTackle: 3, slidingTackle: 6 } },
  { id: 'backbone', name: 'Backbone', tint: '#8E9A90', boosts: { vision: 3, shortPassing: 3, longPassing: 6, interceptions: 6, defensiveAwareness: 3, standingTackle: 6, slidingTackle: 3, stamina: 6, strength: 3, aggression: 6 } },
];

type FaceKey = 'pac' | 'sho' | 'pas' | 'dri' | 'def' | 'phy';
type StatBag = Partial<Record<MetaAttr, number>>;

function value(stats: StatBag, key: MetaAttr, boosts?: ChemBoosts) {
  return Math.min(99, (stats[key] ?? 0) + (boosts?.[key] ?? 0));
}

function pace(stats: StatBag, boosts?: ChemBoosts) {
  return value(stats, 'acceleration', boosts) * 0.45 + value(stats, 'sprintSpeed', boosts) * 0.55;
}
function shooting(stats: StatBag, boosts?: ChemBoosts) {
  return (
    value(stats, 'positioning', boosts) * 0.05 +
    value(stats, 'finishing', boosts) * 0.45 +
    value(stats, 'shotPower', boosts) * 0.2 +
    value(stats, 'longShots', boosts) * 0.2 +
    value(stats, 'volleys', boosts) * 0.05 +
    value(stats, 'penalties', boosts) * 0.05
  );
}
function passing(stats: StatBag, boosts?: ChemBoosts) {
  return (
    value(stats, 'vision', boosts) * 0.2 +
    value(stats, 'crossing', boosts) * 0.2 +
    value(stats, 'freeKickAccuracy', boosts) * 0.05 +
    value(stats, 'shortPassing', boosts) * 0.35 +
    value(stats, 'longPassing', boosts) * 0.15 +
    value(stats, 'curve', boosts) * 0.05
  );
}
function dribbling(stats: StatBag, boosts?: ChemBoosts) {
  return (
    value(stats, 'agility', boosts) * 0.1 +
    value(stats, 'balance', boosts) * 0.05 +
    value(stats, 'reactions', boosts) * 0.05 +
    value(stats, 'ballControl', boosts) * 0.3 +
    value(stats, 'dribbling', boosts) * 0.45 +
    value(stats, 'composure', boosts) * 0.05
  );
}
function defending(stats: StatBag, boosts?: ChemBoosts) {
  return (
    value(stats, 'interceptions', boosts) * 0.2 +
    value(stats, 'headingAccuracy', boosts) * 0.1 +
    value(stats, 'defensiveAwareness', boosts) * 0.3 +
    value(stats, 'standingTackle', boosts) * 0.3 +
    value(stats, 'slidingTackle', boosts) * 0.1
  );
}
function physical(stats: StatBag, boosts?: ChemBoosts) {
  return (
    value(stats, 'jumping', boosts) * 0.05 +
    value(stats, 'stamina', boosts) * 0.25 +
    value(stats, 'strength', boosts) * 0.5 +
    value(stats, 'aggression', boosts) * 0.2
  );
}

const FORMULAS: Record<FaceKey, (stats: StatBag, boosts?: ChemBoosts) => number> = {
  pac: pace,
  sho: shooting,
  pas: passing,
  dri: dribbling,
  def: defending,
  phy: physical,
};

export function chemFaceDelta(stats: StatBag, boosts: ChemBoosts | undefined): Partial<Record<FaceKey, number>> {
  if (!boosts) return {};
  const delta: Partial<Record<FaceKey, number>> = {};
  (Object.keys(FORMULAS) as FaceKey[]).forEach((key) => {
    const change = Math.round(FORMULAS[key](stats, boosts)) - Math.round(FORMULAS[key](stats));
    if (change > 0) delta[key] = change;
  });
  return delta;
}

export function boostedStat(base: number, boost: number) {
  return Math.min(99, base + boost);
}
