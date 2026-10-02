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
