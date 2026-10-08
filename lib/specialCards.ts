import heroesFile from '@/assets/data/heroes.json';
import totwFile from '@/assets/data/totw.json';

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

export const SQUAD_FOUNDATIONS_PLAYERS: FcPlayer[] = [{
  id: 'patati--foundations',
  name: 'Patati',
  en: 'Weslley Patati',
  rating: 84,
  position: 'RW',
  nation: 'ברזיל',
  league: 'Eredivisie',
  club: 'AZ',
  face: { ovr: 84, pac: 90, sho: 82, pas: 77, dri: 84, def: 40, phy: 75 },
}];

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
} | null {
  const row = totwByBase.get(baseId);
  if (!row) return null;
  return {
    rating: row.rating,
    position: row.position,
    face: row.face,
    ...(row.positions?.length ? { positions: row.positions } : {}),
    ...(row.playstyles?.length ? { playstyles: row.playstyles } : {}),
  };
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

/** Only truly standalone TOTW rows live here; TOTW rows with baseId are generated once by withPromoCards(). */
export const SOLO_TOTW: FcPlayer[] = totw
  .filter((row) => Boolean(row.id) && !row.baseId)
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
