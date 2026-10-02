import type { CardQuality, SquadRules } from '@/lib/types';
import type { FcPlayer } from '@/lib/fcPlayers';

export type FormationId =
  | '3142'
  | '3412'
  | '3421'
  | '343'
  | '352'
  | '41212'
  | '41212-2'
  | '4132'
  | '4141'
  | '4213'
  | '4222'
  | '4231'
  | '4231-2'
  | '424'
  | '4312'
  | '4321'
  | '433'
  | '433-2'
  | '433-3'
  | '433-4'
  | '4411'
  | '4411-2'
  | '442'
  | '442-2'
  | '451'
  | '451-2'
  | '5212'
  | '5221'
  | '523'
  | '532'
  | '541';

export type PitchSlot = {
  id: string;
  position: string;
};

export type Formation = {
  id: FormationId;
  label: string;
  lines: PitchSlot[][];
  links: [string, string][];
};

const pos = (id: string, position: string): PitchSlot => ({ id, position });

const back4 = [pos('lb', 'LB'), pos('lcb', 'CB'), pos('rcb', 'CB'), pos('rb', 'RB')];
const back3 = [pos('lcb', 'CB'), pos('cb', 'CB'), pos('rcb', 'CB')];
const back5 = [pos('lwb', 'LWB'), pos('lcb', 'CB'), pos('cb', 'CB'), pos('rcb', 'CB'), pos('rwb', 'RWB')];
const keeper = [pos('gk', 'GK')];

function shape(id: FormationId, label: string, lines: PitchSlot[][]): Formation {
  return { id, label, lines: [...lines, keeper], links: [] };
}

/** Ultimate Team shapes from EA FC 27. Attack is the first line, the keeper is last. */
export const FORMATIONS: Formation[] = [
  shape('3142', '3-1-4-2', [
    [pos('lst', 'ST'), pos('rst', 'ST')],
    [pos('lm', 'LM'), pos('lcm', 'CM'), pos('rcm', 'CM'), pos('rm', 'RM')],
    [pos('cdm', 'CDM')],
    back3,
  ]),
  shape('3412', '3-4-1-2', [
    [pos('lst', 'ST'), pos('rst', 'ST')],
    [pos('cam', 'CAM')],
    [pos('lm', 'LM'), pos('lcm', 'CM'), pos('rcm', 'CM'), pos('rm', 'RM')],
    back3,
  ]),
  shape('3421', '3-4-2-1', [
    [pos('st', 'ST')],
    [pos('lcam', 'CAM'), pos('rcam', 'CAM')],
    [pos('lm', 'LM'), pos('lcm', 'CM'), pos('rcm', 'CM'), pos('rm', 'RM')],
    back3,
  ]),
  shape('343', '3-4-3', [
    [pos('lw', 'LW'), pos('st', 'ST'), pos('rw', 'RW')],
    [pos('lm', 'LM'), pos('lcm', 'CM'), pos('rcm', 'CM'), pos('rm', 'RM')],
    back3,
  ]),
  shape('352', '3-5-2', [
    [pos('lst', 'ST'), pos('rst', 'ST')],
    [pos('lm', 'LM'), pos('lcm', 'CM'), pos('cam', 'CAM'), pos('rcm', 'CM'), pos('rm', 'RM')],
    back3,
  ]),
  shape('41212', '4-1-2-1-2', [
    [pos('lst', 'ST'), pos('rst', 'ST')],
    [pos('cam', 'CAM')],
    [pos('lcm', 'CM'), pos('rcm', 'CM')],
    [pos('cdm', 'CDM')],
    back4,
  ]),
  shape('41212-2', '4-1-2-1-2 (2)', [
    [pos('lst', 'ST'), pos('rst', 'ST')],
    [pos('cam', 'CAM')],
    [pos('lm', 'LM'), pos('rm', 'RM')],
    [pos('cdm', 'CDM')],
    back4,
  ]),
  shape('4132', '4-1-3-2', [
    [pos('lst', 'ST'), pos('rst', 'ST')],
    [pos('lcm', 'CM'), pos('cm', 'CM'), pos('rcm', 'CM')],
    [pos('cdm', 'CDM')],
    back4,
  ]),
  shape('4141', '4-1-4-1', [
    [pos('st', 'ST')],
    [pos('lm', 'LM'), pos('lcm', 'CM'), pos('rcm', 'CM'), pos('rm', 'RM')],
    [pos('cdm', 'CDM')],
    back4,
  ]),
  shape('4213', '4-2-1-3', [
    [pos('lw', 'LW'), pos('st', 'ST'), pos('rw', 'RW')],
    [pos('cam', 'CAM')],
    [pos('lcdm', 'CDM'), pos('rcdm', 'CDM')],
    back4,
  ]),
  shape('4222', '4-2-2-2', [
    [pos('lst', 'ST'), pos('rst', 'ST')],
    [pos('lcam', 'CAM'), pos('rcam', 'CAM')],
    [pos('lcdm', 'CDM'), pos('rcdm', 'CDM')],
    back4,
  ]),
  shape('4231', '4-2-3-1', [
    [pos('st', 'ST')],
    [pos('lm', 'LM'), pos('cam', 'CAM'), pos('rm', 'RM')],
    [pos('lcdm', 'CDM'), pos('rcdm', 'CDM')],
    back4,
  ]),
  shape('4231-2', '4-2-3-1 (2)', [
    [pos('st', 'ST')],
    [pos('lcam', 'CAM'), pos('cam', 'CAM'), pos('rcam', 'CAM')],
    [pos('lcdm', 'CDM'), pos('rcdm', 'CDM')],
    back4,
  ]),
  shape('424', '4-2-4', [
    [pos('lw', 'LW'), pos('lst', 'ST'), pos('rst', 'ST'), pos('rw', 'RW')],
    [pos('lcdm', 'CDM'), pos('rcdm', 'CDM')],
    back4,
  ]),
  shape('4312', '4-3-1-2', [
    [pos('lst', 'ST'), pos('rst', 'ST')],
    [pos('cam', 'CAM')],
    [pos('lcm', 'CM'), pos('cm', 'CM'), pos('rcm', 'CM')],
    back4,
  ]),
  shape('4321', '4-3-2-1', [
    [pos('st', 'ST')],
    [pos('lcam', 'CAM'), pos('rcam', 'CAM')],
    [pos('lcm', 'CM'), pos('cm', 'CM'), pos('rcm', 'CM')],
    back4,
  ]),
  {
    id: '433',
    label: '4-3-3',
    lines: [
      [pos('lw', 'LW'), pos('st', 'ST'), pos('rw', 'RW')],
      [pos('lcm', 'CM'), pos('cm', 'CM'), pos('rcm', 'CM')],
      [pos('lb', 'LB'), pos('lcb', 'CB'), pos('rcb', 'CB'), pos('rb', 'RB')],
      [pos('gk', 'GK')],
    ],
    links: [
      ['gk', 'lcb'],
      ['gk', 'rcb'],
      ['lb', 'lcb'],
      ['lb', 'lcm'],
      ['lcb', 'rcb'],
      ['lcb', 'cm'],
      ['rcb', 'rb'],
      ['rcb', 'cm'],
      ['rb', 'rcm'],
      ['lcm', 'cm'],
      ['lcm', 'lw'],
      ['cm', 'rcm'],
      ['cm', 'st'],
      ['rcm', 'rw'],
      ['lw', 'st'],
      ['rw', 'st'],
    ],
  },
  {
    id: '442',
    label: '4-4-2',
    lines: [
      [pos('lst', 'ST'), pos('rst', 'ST')],
      [pos('lm', 'LM'), pos('lcm', 'CM'), pos('rcm', 'CM'), pos('rm', 'RM')],
      [pos('lb', 'LB'), pos('lcb', 'CB'), pos('rcb', 'CB'), pos('rb', 'RB')],
      [pos('gk', 'GK')],
    ],
    links: [
      ['gk', 'lcb'],
      ['gk', 'rcb'],
      ['lb', 'lcb'],
      ['lb', 'lm'],
      ['lcb', 'rcb'],
      ['lcb', 'lcm'],
      ['rcb', 'rb'],
      ['rcb', 'rcm'],
      ['rb', 'rm'],
      ['lm', 'lcm'],
      ['lm', 'lst'],
      ['lcm', 'rcm'],
      ['lcm', 'lst'],
      ['rcm', 'rm'],
      ['rcm', 'rst'],
      ['rm', 'rst'],
      ['lst', 'rst'],
    ],
  },
  shape('433-2', '4-3-3 (2)', [
    [pos('lw', 'LW'), pos('st', 'ST'), pos('rw', 'RW')],
    [pos('lcdm', 'CDM'), pos('cm', 'CM'), pos('rcdm', 'CDM')],
    back4,
  ]),
  shape('433-3', '4-3-3 (3)', [
    [pos('lw', 'LW'), pos('cf', 'CF'), pos('rw', 'RW')],
    [pos('lcm', 'CM'), pos('cam', 'CAM'), pos('rcm', 'CM')],
    back4,
  ]),
  shape('433-4', '4-3-3 (4)', [
    [pos('lw', 'LW'), pos('st', 'ST'), pos('rw', 'RW')],
    [pos('lcm', 'CM'), pos('cam', 'CAM'), pos('rcm', 'CM')],
    back4,
  ]),
  shape('4411', '4-4-1-1', [
    [pos('st', 'ST')],
    [pos('cf', 'CF')],
    [pos('lm', 'LM'), pos('lcm', 'CM'), pos('rcm', 'CM'), pos('rm', 'RM')],
    back4,
  ]),
  shape('4411-2', '4-4-1-1 (2)', [
    [pos('st', 'ST')],
    [pos('cam', 'CAM')],
    [pos('lm', 'LM'), pos('lcm', 'CM'), pos('rcm', 'CM'), pos('rm', 'RM')],
    back4,
  ]),
  shape('442-2', '4-4-2 (2)', [
    [pos('lst', 'ST'), pos('rst', 'ST')],
    [pos('lm', 'LM'), pos('lcdm', 'CDM'), pos('rcdm', 'CDM'), pos('rm', 'RM')],
    back4,
  ]),
  shape('451', '4-5-1', [
    [pos('st', 'ST')],
    [pos('lm', 'LM'), pos('lcam', 'CAM'), pos('cam', 'CAM'), pos('rcam', 'CAM'), pos('rm', 'RM')],
    back4,
  ]),
  shape('451-2', '4-5-1 (2)', [
    [pos('st', 'ST')],
    [pos('lm', 'LM'), pos('lcm', 'CM'), pos('cm', 'CM'), pos('rcm', 'CM'), pos('rm', 'RM')],
    back4,
  ]),
  shape('5212', '5-2-1-2', [
    [pos('lst', 'ST'), pos('rst', 'ST')],
    [pos('cam', 'CAM')],
    [pos('lcm', 'CM'), pos('rcm', 'CM')],
    back5,
  ]),
  shape('5221', '5-2-2-1', [
    [pos('st', 'ST')],
    [pos('lm', 'LM'), pos('rm', 'RM')],
    [pos('lcdm', 'CDM'), pos('rcdm', 'CDM')],
    back5,
  ]),
  shape('523', '5-2-3', [
    [pos('lw', 'LW'), pos('st', 'ST'), pos('rw', 'RW')],
    [pos('lcm', 'CM'), pos('rcm', 'CM')],
    back5,
  ]),
  shape('532', '5-3-2', [
    [pos('lst', 'ST'), pos('rst', 'ST')],
    [pos('lcm', 'CM'), pos('cm', 'CM'), pos('rcm', 'CM')],
    back5,
  ]),
  shape('541', '5-4-1', [
    [pos('st', 'ST')],
    [pos('lm', 'LM'), pos('lcm', 'CM'), pos('rcm', 'CM'), pos('rm', 'RM')],
    back5,
  ]),
];

FORMATIONS.sort((a, b) => a.label.localeCompare(b.label, 'en', { numeric: true }));

const FITS: Record<string, string[]> = {
  GK: ['GK'],
  CB: ['CB'],
  LB: ['LB', 'LWB'],
  RB: ['RB', 'RWB'],
  LWB: ['LWB', 'LB', 'LM'],
  RWB: ['RWB', 'RB', 'RM'],
  CDM: ['CDM', 'CM'],
  CM: ['CM', 'CDM', 'CAM'],
  CAM: ['CAM', 'CM', 'CF'],
  CF: ['CF', 'ST', 'CAM'],
  LM: ['LM', 'LW', 'LWB'],
  RM: ['RM', 'RW', 'RWB'],
  LW: ['LW', 'LM'],
  RW: ['RW', 'RM'],
  ST: ['ST', 'CF'],
};

export function positionFits(playerPosition: string, slotPosition: string): boolean {
  return (FITS[playerPosition] ?? [playerPosition]).includes(slotPosition);
}

/** Legacy neighbor-link strength (club / league / nation). Kept for tooling. */
export function linkValue(a: FcPlayer, b: FcPlayer): number {
  if (a.club === b.club) return 3;
  let value = 0;
  if (a.league === b.league) value += 1;
  if (a.nation === b.nation) value += 1;
  return value;
}

/** EA FC (from FIFA 23+) thresholds: how many matching teammates unlock each chem pip. */
function chemTier(count: number, thresholds: [number, number, number]): number {
  if (count >= thresholds[2]) return 3;
  if (count >= thresholds[1]) return 2;
  if (count >= thresholds[0]) return 1;
  return 0;
}

/**
 * Modern squad chemistry for one player (0–3 diamonds).
 * Club 2/4/7 · Nation 2/5/8 · League 3/5/8 — wrong position = 0.
 */
export function modernPlayerChem(player: FcPlayer, squad: FcPlayer[], inPosition: boolean): number {
  if (!inPosition) return 0;
  const clubN = squad.filter((item) => item.club === player.club).length;
  const nationN = squad.filter((item) => item.nation === player.nation).length;
  const leagueN = squad.filter((item) => item.league === player.league).length;
  return Math.min(
    3,
    chemTier(clubN, [2, 4, 7]) + chemTier(nationN, [2, 5, 8]) + chemTier(leagueN, [3, 5, 8]),
  );
}

export function squadRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  const above = ratings.reduce((sum, rating) => sum + (rating > average ? rating - average : 0), 0);
  return Math.round(average + above / ratings.length);
}

export function cardQuality(rating: number): CardQuality {
  if (rating >= 75) return 'gold';
  if (rating >= 65) return 'silver';
  return 'bronze';
}

const QUALITY_FLOOR: Record<CardQuality, number> = { bronze: 0, silver: 65, gold: 75 };

export type RuleCheck = { label: string; ok: boolean };

export type SquadReport = {
  chemistry: number;
  rating: number | null;
  nations: number;
  filled: number;
  playerChem: Record<string, number>;
  checks: RuleCheck[];
  ready: boolean;
};

export function isFormationId(id: string): id is FormationId {
  return FORMATIONS.some((formation) => formation.id === id);
}

export function formationById(id: string | null | undefined): Formation {
  return FORMATIONS.find((formation) => formation.id === id) ?? FORMATIONS[0];
}

export function slotPosition(formation: Formation, slotId: string): string {
  for (const line of formation.lines) {
    const slot = line.find((item) => item.id === slotId);
    if (slot) return slot.position;
  }
  return 'CM';
}

export function evaluateSquad(
  formation: Formation,
  placed: Record<string, FcPlayer | null>,
  rules: SquadRules | null,
): SquadReport {
  const playerChem: Record<string, number> = {};
  const filledPlayers: FcPlayer[] = [];

  for (const line of formation.lines) {
    for (const slot of line) {
      const player = placed[slot.id];
      if (player) filledPlayers.push(player);
    }
  }

  for (const line of formation.lines) {
    for (const slot of line) {
      const player = placed[slot.id];
      if (!player) {
        playerChem[slot.id] = 0;
        continue;
      }
      playerChem[slot.id] = modernPlayerChem(player, filledPlayers, positionFits(player.position, slot.position));
    }
  }

  const chemistry = Object.values(playerChem).reduce((sum, value) => sum + value, 0);
  const nations = new Set(filledPlayers.map((player) => player.nation)).size;
  const rating = filledPlayers.length === 11 ? squadRating(filledPlayers.map((player) => player.rating)) : null;
  const checks = buildChecks(filledPlayers, chemistry, rating, rules);
  return {
    chemistry,
    rating,
    nations,
    filled: filledPlayers.length,
    playerChem,
    checks,
    ready: checks.every((check) => check.ok),
  };
}

function countBy(players: FcPlayer[], key: (player: FcPlayer) => string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const player of players) {
    const value = key(player);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

function buildChecks(
  players: FcPlayer[],
  chemistry: number,
  rating: number | null,
  rules: SquadRules | null,
): RuleCheck[] {
  const checks: RuleCheck[] = [{ label: `11 שחקנים (${players.length})`, ok: players.length === 11 }];
  const targetChem = rules?.chemistry ?? 0;
  if (targetChem > 0) checks.push({ label: `כימיה ${targetChem} (עכשיו ${chemistry})`, ok: chemistry >= targetChem });
  if (!rules) return checks;

  if (rules.minRating) {
    checks.push({
      label: `דירוג קבוצה ${rules.minRating}${rating === null ? '' : ` (עכשיו ${rating})`}`,
      ok: rating !== null && rating >= rules.minRating,
    });
  }
  if (rules.minNations) {
    const nations = new Set(players.map((player) => player.nation)).size;
    checks.push({ label: `לפחות ${rules.minNations} מדינות (${nations})`, ok: nations >= rules.minNations });
  }
  if (rules.minClubs) {
    const clubs = new Set(players.map((player) => player.club)).size;
    checks.push({ label: `לפחות ${rules.minClubs} מועדונים (${clubs})`, ok: clubs >= rules.minClubs });
  }
  if (rules.maxClubs) {
    const clubs = new Set(players.map((player) => player.club)).size;
    checks.push({ label: `עד ${rules.maxClubs} מועדונים (${clubs})`, ok: clubs <= rules.maxClubs });
  }
  if (rules.minSameClub) {
    const highest = Math.max(0, ...countBy(players, (player) => player.club).values());
    checks.push({
      label: `לפחות ${rules.minSameClub} מאותו מועדון (${highest})`,
      ok: highest >= rules.minSameClub,
    });
  }
  if (rules.maxLeagues) {
    const leagues = new Set(players.map((player) => player.league)).size;
    checks.push({ label: `עד ${rules.maxLeagues} ליגות (${leagues})`, ok: leagues <= rules.maxLeagues });
  }
  if (rules.maxSameLeague) {
    const highest = Math.max(0, ...countBy(players, (player) => player.league).values());
    checks.push({ label: `עד ${rules.maxSameLeague} מאותה ליגה (${highest})`, ok: highest <= rules.maxSameLeague });
  }
  if (rules.minSameLeague) {
    const highest = Math.max(0, ...countBy(players, (player) => player.league).values());
    checks.push({
      label: `לפחות ${rules.minSameLeague} מאותה ליגה (${highest})`,
      ok: highest >= rules.minSameLeague,
    });
  }
  if (rules.maxSameClub) {
    const highest = Math.max(0, ...countBy(players, (player) => player.club).values());
    checks.push({ label: `עד ${rules.maxSameClub} מאותו מועדון (${highest})`, ok: highest <= rules.maxSameClub });
  }
  if (rules.sameNationAtLeast) {
    const highest = Math.max(0, ...countBy(players, (player) => player.nation).values());
    checks.push({
      label: `לפחות ${rules.sameNationAtLeast} מאותה מדינה (${highest})`,
      ok: highest >= rules.sameNationAtLeast,
    });
  }
  for (const rule of rules.nationAtLeast ?? []) {
    const count = players.filter((player) => player.nation === rule.nation).length;
    checks.push({ label: `לפחות ${rule.count} מ${rule.nation} (${count})`, ok: count >= rule.count });
  }
  for (const rule of rules.leagueAtLeast ?? []) {
    const count = players.filter((player) => player.league === rule.league).length;
    checks.push({ label: `לפחות ${rule.count} מ${rule.league} (${count})`, ok: count >= rule.count });
  }
  if (rules.nationsAtLeast) {
    const names = rules.nationsAtLeast.nations.join(' או ');
    const count = players.filter((player) => rules.nationsAtLeast?.nations.includes(player.nation)).length;
    checks.push({
      label: `לפחות ${rules.nationsAtLeast.count} מ${names} (${count})`,
      ok: count >= rules.nationsAtLeast.count,
    });
  }
  if (rules.clubsAtLeast) {
    const names = rules.clubsAtLeast.clubs.join(' או ');
    const count = players.filter((player) => rules.clubsAtLeast?.clubs.includes(player.club)).length;
    checks.push({ label: `לפחות ${rules.clubsAtLeast.count} מ${names} (${count})`, ok: count >= rules.clubsAtLeast.count });
  }
  if (rules.minGold) {
    const count = players.filter((player) => cardQuality(player.rating) === 'gold').length;
    checks.push({ label: `לפחות ${rules.minGold} זהב (${count})`, ok: count >= rules.minGold });
  }
  if (rules.minSilver) {
    const count = players.filter((player) => cardQuality(player.rating) === 'silver').length;
    checks.push({ label: `לפחות ${rules.minSilver} כסף (${count})`, ok: count >= rules.minSilver });
  }
  if (rules.minBronze) {
    const count = players.filter((player) => cardQuality(player.rating) === 'bronze').length;
    checks.push({ label: `לפחות ${rules.minBronze} ארד (${count})`, ok: count >= rules.minBronze });
  }
  if (rules.minQuality && rules.minQuality !== 'bronze') {
    const floor = QUALITY_FLOOR[rules.minQuality];
    const label = rules.minQuality === 'gold' ? 'זהב' : 'כסף';
    const ok = players.length > 0 && players.every((player) => player.rating >= floor);
    checks.push({ label: `כל הכרטיסים מ${label} ומעלה`, ok });
  }
  if (rules.exactQuality) {
    const label = rules.exactQuality === 'gold' ? 'זהב' : rules.exactQuality === 'silver' ? 'כסף' : 'ארד';
    const count = players.filter((player) => cardQuality(player.rating) === rules.exactQuality).length;
    checks.push({ label: `כל הכרטיסים ${label} (${count}/11)`, ok: players.length === 11 && count === 11 });
  }
  return checks;
}

export const POSITION_LABEL: Record<string, string> = {
  GK: 'שוער',
  CB: 'בלם',
  LB: 'מגן שמאלי',
  RB: 'מגן ימני',
  CDM: 'קשר אחורי',
  CM: 'קשר',
  CAM: 'קשר התקפי',
  LM: 'קישור שמאלי',
  RM: 'קישור ימני',
  LW: 'כנף שמאלי',
  RW: 'כנף ימני',
  ST: 'חלוץ',
};
