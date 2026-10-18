import heroesFile from '@/assets/data/heroes.json';
import totwFile from '@/assets/data/totw.json';
import starPerformersFile from '@/assets/data/starPerformers.json';

import type { FcPlayer } from '@/lib/fcPlayers';

type Face = NonNullable<FcPlayer['face']>;

type HeroRow = {
  id: string;
  en: string;
  name: string;
  rating: number;
  position: string;
  nation: string;
  league: string;
  club: string;
  face?: Face;
  positions?: string[];
  playstyles?: { name: string; plus: boolean }[];
};

type TotwRow = {
  baseId?: string;
  id?: string;
  en?: string;
  name?: string;
  nation?: string;
  league?: string;
  club?: string;
  position: string;
  rating: number;
  face: Face;
  positions?: string[];
  playstyles?: { name: string; plus: boolean }[];
};

const heroes = heroesFile as HeroRow[];
const totw = totwFile as TotwRow[];

export type StarPerformerRow = {
  baseId: string;
  en: string;
  name: string;
  rating: number;
  position: string;
  nation: string;
  league: string;
  club: string;
  foot: 'L' | 'R';
  sm: number;
  wf: number;
  cardId: number;
  face: Face;
  positions?: string[];
  playstyles?: { name: string; plus: boolean }[];
  detailedStats: Record<string, number>;
  priceConsole: number;
  pricePc: number;
  priceSource: string;
  priceChecked: string;
  priceNote?: string;
  playerSourceUrl?: string;
  portraitUrl?: string;
  priceSourceUrl?: string;
  detailedStatsComplete?: boolean;
  missingDetailedStats?: string[];
};

const starPerformers = starPerformersFile as unknown as StarPerformerRow[];
const starPerformerByBase = new Map(starPerformers.map((row) => [row.baseId, row]));

export function starPerformerFor(baseId: string): StarPerformerRow | null {
  return starPerformerByBase.get(baseId) ?? null;
}


const OTW_CARDS: Record<string, {
  rating: number;
  position: string;
  face: Face;
  positions?: string[];
  playstyles?: { name: string; plus: boolean }[];
}> = {
  'ea-264947-nicole-anyomi': {
    rating: 84,
    position: 'ST',
    face: { ovr: 84, pac: 90, sho: 82, pas: 74, dri: 84, def: 55, phy: 83 },
    positions: ['ST', 'LM', 'CAM', 'LW'],
    playstyles: [
      { name: 'Low Driven Shot', plus: false },
      { name: 'Jockey', plus: false },
      { name: 'Technical', plus: false },
      { name: 'Trickster', plus: false },
      { name: 'Quick Step', plus: false },
    ],
  },
};

export function otwFor(baseId: string) {
  return OTW_CARDS[baseId] ?? null;
}

/** Standalone promo entries for Star Performers that are not present in the regular roster. */
export const SOLO_STAR_PERFORMERS: FcPlayer[] = starPerformers.map((row) => ({
  id: `${row.baseId}--star-performer`,
  baseId: row.baseId,
  name: row.name,
  en: row.en,
  rating: row.rating,
  position: row.position,
  nation: row.nation,
  league: row.league,
  club: row.club,
  edition: 'star-performer',
  face: row.face,
  ...(row.positions?.length ? { positions: row.positions } : {}),
  ...(row.playstyles?.length ? { playstyles: row.playstyles } : {}),
}));

export const HERO_PLAYERS: FcPlayer[] = heroes.map((hero) => ({
  id: hero.id,
  name: hero.name,
  en: hero.en,
  rating: hero.rating,
  position: hero.position,
  nation: hero.nation,
  league: hero.league,
  club: hero.club,
  edition: 'hero',
  ...(hero.face ? { face: hero.face } : {}),
  ...(hero.positions?.length ? { positions: hero.positions } : {}),
  ...(hero.playstyles?.length ? { playstyles: hero.playstyles } : {}),
}));

const totwByBase = new Map<string, TotwRow>();
for (const row of totw) {
  if (row.baseId) totwByBase.set(row.baseId, row);
}

export function totwFor(baseId: string): {
  rating: number;
  position: string;
  face: Face;
  positions?: string[];
  playstyles?: { name: string; plus: boolean }[];
  name?: string;
  en?: string;
  nation?: string;
  league?: string;
  club?: string;
} | null {
  const row = totwByBase.get(baseId);
  if (!row) return null;
  return {
    rating: row.rating,
    position: row.position,
    face: row.face,
    ...(row.positions?.length ? { positions: row.positions } : {}),
    ...(row.playstyles ? { playstyles: row.playstyles } : {}),
    ...(row.name ? { name: row.name } : {}),
    ...(row.en ? { en: row.en } : {}),
    ...(row.nation ? { nation: row.nation } : {}),
    ...(row.league ? { league: row.league } : {}),
    ...(row.club ? { club: row.club } : {}),
  };
}

export const SOLO_TOTW: FcPlayer[] = totw
  .filter((row) => !row.baseId && row.id)
  .map((row) => ({
    id: row.id!,
    name: row.name || row.en || row.id!,
    en: row.en,
    rating: row.rating,
    position: row.position,
    nation: row.nation || '',
    league: row.league || 'TOTW',
    club: row.club || 'TOTW',
    edition: 'totw' as const,
    face: row.face,
  }));
