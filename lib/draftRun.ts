import { L, N, PLAYERS, type FcPlayer } from '@/lib/fcPlayers';
import { playerMedia } from '@/lib/playerMedia';

export type DraftSlot = { id: string; position: string; x: number; y: number };

export type DraftFormation = {
  id: string;
  label: string;
  slots: DraftSlot[];
  links: [string, string][];
};

const slot = (id: string, position: string, x: number, y: number): DraftSlot => ({ id, position, x, y });

export const DRAFT_FORMATIONS: DraftFormation[] = [
  {
    id: '433',
    label: '4-3-3',
    slots: [
      slot('st', 'ST', 50, 14),
      slot('lw', 'LW', 18, 18),
      slot('rw', 'RW', 82, 18),
      slot('lcm', 'CM', 24, 46),
      slot('cm', 'CM', 50, 50),
      slot('rcm', 'CM', 76, 46),
      slot('lb', 'LB', 12, 72),
      slot('lcb', 'CB', 36, 76),
      slot('rcb', 'CB', 64, 76),
      slot('rb', 'RB', 88, 72),
      slot('gk', 'GK', 50, 92),
    ],
    links: [
      ['st', 'lw'],
      ['st', 'rw'],
      ['st', 'cm'],
      ['lw', 'lcm'],
      ['rw', 'rcm'],
      ['lcm', 'cm'],
      ['cm', 'rcm'],
      ['lcm', 'lb'],
      ['rcm', 'rb'],
      ['lb', 'lcb'],
      ['lcb', 'rcb'],
      ['rcb', 'rb'],
      ['lcb', 'gk'],
      ['rcb', 'gk'],
    ],
  },
  {
    id: '442',
    label: '4-4-2',
    slots: [
      slot('lst', 'ST', 36, 14),
      slot('rst', 'ST', 64, 14),
      slot('lm', 'LM', 12, 42),
      slot('lcm', 'CM', 36, 48),
      slot('rcm', 'CM', 64, 48),
      slot('rm', 'RM', 88, 42),
      slot('lb', 'LB', 12, 72),
      slot('lcb', 'CB', 36, 76),
      slot('rcb', 'CB', 64, 76),
      slot('rb', 'RB', 88, 72),
      slot('gk', 'GK', 50, 92),
    ],
    links: [
      ['lst', 'rst'],
      ['lst', 'lm'],
      ['lst', 'lcm'],
      ['rst', 'rm'],
      ['rst', 'rcm'],
      ['lm', 'lcm'],
      ['lcm', 'rcm'],
      ['rcm', 'rm'],
      ['lm', 'lb'],
      ['rm', 'rb'],
      ['lb', 'lcb'],
      ['lcb', 'rcb'],
      ['rcb', 'rb'],
      ['lcb', 'gk'],
      ['rcb', 'gk'],
    ],
  },
  {
    id: '4231',
    label: '4-2-3-1',
    slots: [
      slot('st', 'ST', 50, 12),
      slot('lam', 'LW', 20, 32),
      slot('cam', 'CAM', 50, 34),
      slot('ram', 'RW', 80, 32),
      slot('lcdm', 'CDM', 34, 54),
      slot('rcdm', 'CDM', 66, 54),
      slot('lb', 'LB', 12, 74),
      slot('lcb', 'CB', 36, 78),
      slot('rcb', 'CB', 64, 78),
      slot('rb', 'RB', 88, 74),
      slot('gk', 'GK', 50, 92),
    ],
    links: [
      ['st', 'lam'],
      ['st', 'cam'],
      ['st', 'ram'],
      ['lam', 'cam'],
      ['cam', 'ram'],
      ['lam', 'lcdm'],
      ['ram', 'rcdm'],
      ['cam', 'lcdm'],
      ['cam', 'rcdm'],
      ['lcdm', 'rcdm'],
      ['lcdm', 'lb'],
      ['rcdm', 'rb'],
      ['lb', 'lcb'],
      ['lcb', 'rcb'],
      ['rcb', 'rb'],
      ['lcb', 'gk'],
      ['rcb', 'gk'],
    ],
  },
  {
    id: '352',
    label: '3-5-2',
    slots: [
      slot('lst', 'ST', 36, 12),
      slot('rst', 'ST', 64, 12),
      slot('lm', 'LM', 12, 40),
      slot('lcm', 'CM', 32, 46),
      slot('cam', 'CAM', 50, 36),
      slot('rcm', 'CM', 68, 46),
      slot('rm', 'RM', 88, 40),
      slot('lcb', 'CB', 28, 74),
      slot('cb', 'CB', 50, 78),
      slot('rcb', 'CB', 72, 74),
      slot('gk', 'GK', 50, 92),
    ],
    links: [
      ['lst', 'rst'],
      ['lst', 'lm'],
      ['lst', 'cam'],
      ['rst', 'rm'],
      ['rst', 'cam'],
      ['lm', 'lcm'],
      ['lcm', 'cam'],
      ['cam', 'rcm'],
      ['rcm', 'rm'],
      ['lm', 'lcb'],
      ['rm', 'rcb'],
      ['lcb', 'cb'],
      ['cb', 'rcb'],
      ['cb', 'gk'],
    ],
  },
  {
    id: '41212',
    label: '4-1-2-1-2',
    slots: [
      slot('lst', 'ST', 36, 12),
      slot('rst', 'ST', 64, 12),
      slot('cam', 'CAM', 50, 32),
      slot('lm', 'LM', 18, 50),
      slot('rm', 'RM', 82, 50),
      slot('cdm', 'CDM', 50, 62),
      slot('lb', 'LB', 12, 76),
      slot('lcb', 'CB', 36, 80),
      slot('rcb', 'CB', 64, 80),
      slot('rb', 'RB', 88, 76),
      slot('gk', 'GK', 50, 92),
    ],
    links: [
      ['lst', 'rst'],
      ['lst', 'cam'],
      ['rst', 'cam'],
      ['cam', 'lm'],
      ['cam', 'rm'],
      ['lm', 'cdm'],
      ['rm', 'cdm'],
      ['lm', 'lb'],
      ['rm', 'rb'],
      ['cdm', 'lcb'],
      ['cdm', 'rcb'],
      ['lb', 'lcb'],
      ['lcb', 'rcb'],
      ['rcb', 'rb'],
      ['lcb', 'gk'],
      ['rcb', 'gk'],
    ],
  },
];

export type DraftManager = { id: string; name: string; nation: string; league: string; photo: string };

export const DRAFT_MANAGERS: DraftManager[] = [
  {
    id: 'pep',
    name: 'גווארדיולה',
    nation: N.spain,
    league: L.prem,
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Josep_Guardiola_2023-10-04_Fu%C3%9Fball%2C_M%C3%A4nner%2C_UEFA_Champions_League%2C_RB_Leipzig_-_Manchester_City_FC_1DX_2797_%28cropped%29.jpg/330px-Josep_Guardiola_2023-10-04_Fu%C3%9Fball%2C_M%C3%A4nner%2C_UEFA_Champions_League%2C_RB_Leipzig_-_Manchester_City_FC_1DX_2797_%28cropped%29.jpg',
  },
  {
    id: 'carlo',
    name: 'אנצ׳לוטי',
    nation: N.italy,
    league: L.laliga,
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Carlo_Ancelotti_Brazil_V_Morocco_13_June_2026-47.jpg/330px-Carlo_Ancelotti_Brazil_V_Morocco_13_June_2026-47.jpg',
  },
  {
    id: 'alonso',
    name: 'צ׳אבי אלונסו',
    nation: N.spain,
    league: L.laliga,
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Los_Caminos_del_f%C3%BAtbol._Xabi_Alonso_%2839666778464%29_%28cropped%29.jpg/330px-Los_Caminos_del_f%C3%BAtbol._Xabi_Alonso_%2839666778464%29_%28cropped%29.jpg',
  },
  {
    id: 'arteta',
    name: 'ארטטה',
    nation: N.spain,
    league: L.prem,
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Arsenal_v_Everton_-_52223142689_%28cropped%29.jpg/330px-Arsenal_v_Everton_-_52223142689_%28cropped%29.jpg',
  },
  {
    id: 'simeone',
    name: 'סימאונה',
    nation: N.argentina,
    league: L.laliga,
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/25th_Laureus_World_Sports_Awards_-_Red_Carpet_-_Diego_Simeone_-_240422_192621-2_%28cropped%29.jpg/330px-25th_Laureus_World_Sports_Awards_-_Red_Carpet_-_Diego_Simeone_-_240422_192621-2_%28cropped%29.jpg',
  },
];

export const SUB_COUNT = 7;
export const RESERVE_COUNT = 5;

/** LM also draws LW. RM also draws RW. Every other slot stays on that exact position. */
export function slotPositions(position: string): string[] {
  if (position === 'LM') return ['LM', 'LW'];
  if (position === 'RM') return ['RM', 'RW'];
  return [position];
}

export function fitsSlot(player: FcPlayer, position: string): boolean {
  return slotPositions(position).includes(player.position);
}

export function homeSlot(formation: DraftFormation, player: FcPlayer, placed: Record<string, FcPlayer | undefined>) {
  return formation.slots.find((slot) => !placed[slot.id] && fitsSlot(player, slot.position)) ?? null;
}

function chemTier(count: number, thresholds: [number, number, number]) {
  if (count >= thresholds[2]) return 3;
  if (count >= thresholds[1]) return 2;
  if (count >= thresholds[0]) return 1;
  return 0;
}

/** FC 27: out of position is 0. Otherwise club 2/4/7, nation 2/5/8, league 3/5/8, capped at 3. Manager adds 1. */
export function draftPlayerChem(player: FcPlayer, squad: FcPlayer[], manager?: DraftManager | null, slotPosition?: string): number {
  if (slotPosition && !fitsSlot(player, slotPosition)) return 0;
  const clubN = squad.filter((item) => chemKey(item.club) === chemKey(player.club)).length;
  const nationN = squad.filter((item) => chemKey(item.nation) === chemKey(player.nation)).length;
  const leagueN = squad.filter((item) => chemKey(item.league) === chemKey(player.league)).length;
  const base = Math.min(3, chemTier(clubN, [2, 4, 7]) + chemTier(nationN, [2, 5, 8]) + chemTier(leagueN, [3, 5, 8]));
  const fromManager = manager && (chemKey(manager.league) === chemKey(player.league) || chemKey(manager.nation) === chemKey(player.nation)) ? 1 : 0;
  return Math.min(3, base + fromManager);
}

export function draftChemistry(squad: FcPlayer[], manager?: DraftManager | null): number {
  return squad.reduce((sum, player) => sum + draftPlayerChem(player, squad, manager), 0);
}

/**
 * Squad rating used by FUTBIN and in-game squad screens.
 * Sum, add the excess above the average, round that total, divide by the player count, then floor.
 */
export function draftTeamRating(ratings: number[]): number {
  if (!ratings.length) return 0;
  const sum = ratings.reduce((total, rating) => total + rating, 0);
  const average = sum / ratings.length;
  const excess = ratings.reduce((total, rating) => total + (rating > average ? rating - average : 0), 0);
  return Math.floor(Math.round(sum + excess) / ratings.length);
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap];
    copy[swap] = current;
  }
  return copy;
}

function blocked(player: FcPlayer, used: readonly string[]) {
  if (used.includes(player.id)) return true;
  const base = player.baseId ?? player.id;
  return used.some((id) => id === base || id.startsWith(`${base}--`));
}

function hasPhoto(player: FcPlayer) {
  if (player.icon || player.edition) return true;
  return Boolean(playerMedia(player.baseId ?? player.id).photo || playerMedia(player.id).photo);
}

const CHEM_ALIAS: Record<string, string> = {
  'Premier League': L.prem,
  'LALIGA EA SPORTS': L.laliga,
  "Ligue 1 McDonald's": L.ligue1,
  'Serie A Enilive': L.seriea,
  Bundesliga: L.bundes,
  Eredivisie: L.eredivisie,
  'Liga Portugal': L.ligaPt,
  'Major League Soccer': L.mls,
  'ROSHN Saudi League': L.saudi,
  'Scottish Premiership': L.scottish,
  'Liga Profesional de Fútbol': L.lpf,
  'Barclays Women’s Super League': L.wsl,
  "Barclays Women's Super League": L.wsl,
  'Google Pixel Frauen-Bundesliga': L.frauen,
  'Arkema Première Ligue': L.arkema,
  Spain: N.spain,
  France: N.france,
  Germany: N.germany,
  Italy: N.italy,
  England: N.england,
  Brazil: N.brazil,
  Argentina: N.argentina,
  Portugal: N.portugal,
  Netherlands: N.netherlands,
  Belgium: N.belgium,
  Croatia: N.croatia,
  Norway: N.norway,
  Sweden: N.sweden,
  Mexico: N.mexico,
  Ghana: N.ghana,
  Nigeria: N.nigeria,
  Uruguay: N.uruguay,
  Chile: N.chile,
  Finland: N.finland,
  Australia: N.australia,
  Japan: N.japan,
  'Korea Republic': N.korea,
  'United States': N.usa,
  Poland: N.poland,
  Colombia: N.colombia,
  'Czech Republic': N.czech,
  'Republic of Ireland': N.ireland,
};

function chemKey(value: string) {
  return CHEM_ALIAS[value] ?? value;
}

function eligible(used: readonly string[]) {
  return PLAYERS.filter((player) => !blocked(player, used) && player.rating >= 75 && hasPhoto(player));
}

/** First packs stay high. After a few picks the packs drop, and a late pack can be all 75–77. */
function targetRating(pickIndex: number): number {
  const roll = Math.random();
  if (pickIndex <= 0) {
    if (roll < 0.7) return 90;
    if (roll < 0.92) return 87;
    return 85;
  }
  if (pickIndex < 3) {
    if (roll < 0.48) return 88;
    if (roll < 0.82) return 85;
    return 82;
  }
  if (pickIndex < 6) {
    if (roll < 0.16) return 87;
    if (roll < 0.48) return 82;
    return 78;
  }
  if (pickIndex < 9) {
    if (roll < 0.08) return 86;
    if (roll < 0.32) return 80;
    return 76;
  }
  if (roll < 0.07) return 84;
  return 76;
}

function pickNear(pool: FcPlayer[], target: number, taken: Set<string>): FcPlayer | null {
  for (const window of [1, 3, 6, 15]) {
    const near = pool.filter((player) => !taken.has(player.id) && Math.abs(player.rating - target) <= window);
    if (near.length) return near[Math.floor(Math.random() * near.length)];
  }
  const rest = pool.filter((player) => !taken.has(player.id));
  if (!rest.length) return null;
  return rest[Math.floor(Math.random() * rest.length)];
}

function packFrom(pool: FcPlayer[], pickIndex: number): FcPlayer[] {
  const taken = new Set<string>();
  const pack: FcPlayer[] = [];
  for (let index = 0; index < 5; index += 1) {
    const player = pickNear(pool, targetRating(pickIndex), taken);
    if (!player) break;
    taken.add(player.id);
    pack.push(player);
  }
  return shuffle(pack);
}

export function draftCaptain(formation: DraftFormation, used: readonly string[]): FcPlayer[] {
  const pool = eligible(used).filter((player) => player.rating >= 85 && homeSlot(formation, player, {}));
  return packFrom(pool, 0);
}

export function draftForSlot(position: string, used: readonly string[], pickIndex: number): FcPlayer[] {
  return packFrom(eligible(used).filter((player) => fitsSlot(player, position)), pickIndex);
}

export function draftSubPack(used: readonly string[], pickIndex: number): FcPlayer[] {
  return packFrom(eligible(used), pickIndex);
}
